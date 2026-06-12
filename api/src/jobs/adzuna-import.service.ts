import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Company } from '../entities/company.entity.js';
import {
  ContractType,
  ExperienceLevel,
  Job,
  JobStatus,
} from '../entities/job.entity.js';

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  salary_min?: number | null;
  salary_max?: number | null;
  contract_type?: string;
  contract_time?: string;
  location: {
    display_name: string;
    area?: string[];
  };
  company?: {
    display_name?: string;
  };
}

interface AdzunaSearchResponse {
  count?: number;
  results?: AdzunaJob[];
}

const BAHIA_STATE = 'Bahia';
const RESULTS_PER_PAGE = 50;

function mapAdzunaContractType(
  contractType?: string,
  title?: string,
): ContractType {
  const lowerTitle = (title ?? '').toLowerCase();
  if (/estágio|estagiário|estagiaria|apprentice|intern\b/.test(lowerTitle)) {
    return ContractType.INTERN;
  }
  if (/freelance|autônomo|autonomo/.test(lowerTitle)) {
    return ContractType.FREELANCE;
  }
  if (contractType === 'contract') return ContractType.PJ;
  if (contractType === 'temporary') return ContractType.TEMPORARY;
  return ContractType.CLT;
}

function mapExperienceFromTitle(title: string): ExperienceLevel {
  const t = title.toLowerCase();
  if (/estágio|estagiário|estagiaria|intern\b|jovem aprendiz/.test(t)) {
    return ExperienceLevel.INTERN;
  }
  if (/auxiliar/.test(t)) return ExperienceLevel.AUXILIAR;
  if (/assistente/.test(t)) return ExperienceLevel.ASSISTENTE;
  if (/júnior|junior|jr\b/.test(t)) return ExperienceLevel.JUNIOR;
  if (/pleno|mid\b/.test(t)) return ExperienceLevel.MID;
  if (/sênior|senior|sr\b/.test(t)) return ExperienceLevel.SENIOR;
  if (/especialista|specialist/.test(t)) return ExperienceLevel.SPECIALIST;
  if (/freelance/.test(t)) return ExperienceLevel.FREELANCER;
  return ExperienceLevel.MID;
}

function extractCategory(title: string): string {
  const categories: Record<string, string[]> = {
    Tecnologia: [
      'desenvolvedor',
      'developer',
      'programador',
      'software',
      'tech',
      'ti',
      'dados',
      'data',
      'analista de sistemas',
      'devops',
      'frontend',
      'backend',
      'fullstack',
    ],
    Vendas: ['vendedor', 'vendas', 'sales', 'comercial', 'representante'],
    Marketing: ['marketing', 'social media', 'publicidade', 'designer', 'criativo'],
    Administração: [
      'administrativo',
      'administração',
      'secretária',
      'recepcionista',
      'assistente',
    ],
    'Recursos Humanos': ['rh', 'recursos humanos', 'recrutador', 'seleção'],
    Financeiro: ['financeiro', 'contábil', 'contador', 'fiscal', 'tesouraria'],
    Saúde: [
      'enfermeiro',
      'médico',
      'farmacêutico',
      'técnico de enfermagem',
      'saúde',
    ],
    Logística: ['logística', 'motorista', 'entregador', 'estoquista', 'almoxarife'],
    Construção: ['engenheiro', 'arquiteto', 'construção', 'obra', 'pedreiro'],
    Atendimento: [
      'atendimento',
      'suporte',
      'telemarketing',
      'call center',
      'sac',
    ],
  };

  const lowerTitle = title.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowerTitle.includes(keyword))) {
      return category;
    }
  }
  return 'Outros';
}

/** Aceita somente vagas cujo `location.area` inclui o estado Bahia. */
function isBahiaJob(job: AdzunaJob): boolean {
  const area = job.location?.area ?? [];
  return area.some((part) => part.toLowerCase() === 'bahia');
}

function isRemoteJob(job: AdzunaJob): boolean {
  const text = `${job.title} ${job.description}`.toLowerCase();
  return /remoto|remote|home office|trabalho em casa/.test(text);
}

export type AdzunaImportResponse = {
  success: boolean;
  message: string;
  imported: number;
  skipped?: number;
  total_found?: number;
  /** Mantido para compatibilidade com o painel admin */
  city_searched?: string;
  region_searched?: string;
  pages_fetched?: number;
  api_requests?: number;
  error?: string;
};

@Injectable()
export class AdzunaImportService {
  private readonly logger = new Logger(AdzunaImportService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    private readonly config: ConfigService,
  ) {}

  private getCredentials(): { appId: string; appKey: string } {
    const appId =
      this.config.get<string>('ADZUNA_APP_ID') ??
      this.config.get<string>('APPLICATION_ID');
    const appKey =
      this.config.get<string>('ADZUNA_APP_KEY') ??
      this.config.get<string>('APPLICATION_KEY');

    if (!appId?.trim() || !appKey?.trim()) {
      throw new BadRequestException(
        'ADZUNA_APP_ID e ADZUNA_APP_KEY não configuradas',
      );
    }

    return { appId: appId.trim(), appKey: appKey.trim() };
  }

  private getMaxDaysOld(): number {
    const raw = this.config.get<string>('ADZUNA_MAX_DAYS_OLD');
    const parsed = parseInt(raw ?? '30', 10);
    if (!Number.isFinite(parsed) || parsed < 1) return 30;
    return Math.min(parsed, 90);
  }

  private async fetchBahiaPage(
    appId: string,
    appKey: string,
    page: number,
    maxDaysOld: number,
  ): Promise<AdzunaSearchResponse> {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      what: 'vagas',
      where: BAHIA_STATE,
      results_per_page: String(RESULTS_PER_PAGE),
      max_days_old: String(maxDaysOld),
      sort_by: 'date',
    });

    const searchUrl = `https://api.adzuna.com/v1/api/jobs/br/search/${page}?${params.toString()}`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const statusCode = response.status;
      if (statusCode === 429 || statusCode === 403) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message:
              'Limite de buscas da Adzuna atingido. Aguarde a renovação do plano mensal.',
            error: 'QUOTA_EXCEEDED',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      if (statusCode === 401) {
        throw new BadRequestException(
          'Credenciais Adzuna inválidas (app_id / app_key)',
        );
      }
      throw new Error(`Adzuna retornou status ${statusCode} na página ${page}`);
    }

    return (await response.json()) as AdzunaSearchResponse;
  }

  async importFromAdzuna(): Promise<AdzunaImportResponse> {
    const { appId, appKey } = this.getCredentials();
    const maxDaysOld = this.getMaxDaysOld();

    let latestJobs: AdzunaJob[] = [];

    try {
      const data = await this.fetchBahiaPage(appId, appKey, 1, maxDaysOld);
      latestJobs = (data.results ?? []).filter(isBahiaJob).slice(0, RESULTS_PER_PAGE);
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Falha ao consultar Adzuna',
      );
    }

    const uniqueJobs = latestJobs.reduce((acc: AdzunaJob[], job: AdzunaJob) => {
      if (!acc.find((j) => j.id === job.id)) acc.push(job);
      return acc;
    }, []);

    this.logger.log(
      `Adzuna Bahia: ${uniqueJobs.length} vagas mais recentes consultadas (1 requisição)`,
    );

    let defaultCompany = await this.companyRepo.findOne({
      where: { name: 'Vagas Importadas' },
    });
    if (!defaultCompany) {
      const created = this.companyRepo.create({
        user_id: null,
        name: 'Vagas Importadas',
        description: 'Vagas importadas automaticamente de APIs externas',
        location: 'Bahia, Brasil',
        is_verified: false,
      });
      defaultCompany = await this.companyRepo.save(created);
    }

    const jobsToInsert = uniqueJobs.map((job: AdzunaJob) => {
      const employer = job.company?.display_name?.trim();
      const description =
        job.description?.trim() ||
        (employer
          ? `Vaga publicada por ${employer}.`
          : 'Descrição não disponível');

      return {
        title: job.title,
        description,
        location: job.location?.display_name || `${BAHIA_STATE}, Brasil`,
        company_id: defaultCompany.id,
        contract_type: mapAdzunaContractType(job.contract_type, job.title),
        experience_level: mapExperienceFromTitle(job.title),
        remote_option: isRemoteJob(job),
        category: extractCategory(job.title),
        salary_min: job.salary_min ?? null,
        salary_max: job.salary_max ?? null,
        status: JobStatus.ACTIVE,
        external_url: job.redirect_url ?? null,
      };
    });

    if (jobsToInsert.length === 0) {
      return {
        success: true,
        message: `Nenhuma vaga encontrada na Bahia (últimos ${maxDaysOld} dias)`,
        imported: 0,
        region_searched: BAHIA_STATE,
        city_searched: BAHIA_STATE,
        pages_fetched: 1,
        api_requests: 1,
      };
    }

    const externalUrls = jobsToInsert
      .map((j) => j.external_url)
      .filter((url): url is string => url !== null);

    let existingUrls = new Set<string>();
    if (externalUrls.length > 0) {
      const existing = await this.jobRepo.find({
        where: { external_url: In(externalUrls) },
        select: ['external_url'],
      });
      existingUrls = new Set(
        existing
          .map((j) => j.external_url)
          .filter((url): url is string => url !== null),
      );
    }

    const existingByTitle = await this.jobRepo.find({
      select: ['title', 'location'],
    });
    const existingTitleLocations = new Set(
      existingByTitle.map((j) => `${j.title}|${j.location}`),
    );

    const newJobs = jobsToInsert.filter((job) => {
      if (job.external_url && existingUrls.has(job.external_url)) return false;
      if (existingTitleLocations.has(`${job.title}|${job.location}`)) return false;
      return true;
    });

    const skippedCount = jobsToInsert.length - newJobs.length;

    if (newJobs.length === 0) {
      return {
        success: true,
        message: `Nenhuma vaga nova na Bahia (${skippedCount} já existiam)`,
        imported: 0,
        skipped: skippedCount,
        total_found: uniqueJobs.length,
        region_searched: BAHIA_STATE,
        city_searched: BAHIA_STATE,
        pages_fetched: 1,
        api_requests: 1,
      };
    }

    const entities = newJobs.map((row) =>
      this.jobRepo.create({
        company_id: row.company_id,
        title: row.title,
        description: row.description,
        location: row.location,
        contract_type: row.contract_type,
        experience_level: row.experience_level,
        remote_option: row.remote_option,
        category: row.category,
        salary_min: row.salary_min,
        salary_max: row.salary_max,
        status: row.status,
        external_url: row.external_url,
      }),
    );

    const inserted = await this.jobRepo.save(entities);

    return {
      success: true,
      message: `${inserted.length} vagas novas importadas da Bahia (das ${uniqueJobs.length} mais recentes${skippedCount > 0 ? `, ${skippedCount} já existiam` : ''})`,
      imported: inserted.length,
      skipped: skippedCount,
      total_found: uniqueJobs.length,
      region_searched: BAHIA_STATE,
      city_searched: BAHIA_STATE,
      pages_fetched: 1,
      api_requests: 1,
    };
  }
}
