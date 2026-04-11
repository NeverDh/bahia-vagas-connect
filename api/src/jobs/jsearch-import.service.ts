import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
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

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_description: string;
  job_city: string;
  job_state: string;
  job_employment_type: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_required_experience?: { required_experience_in_months?: number };
  job_is_remote: boolean;
  job_posted_at_datetime_utc: string;
  job_apply_link?: string;
}

const BAHIA_CITIES = [
  'Salvador',
  'Feira de Santana',
  'Vitória da Conquista',
  'Camaçari',
  'Itabuna',
  'Juazeiro',
  'Lauro de Freitas',
  'Ilhéus',
  'Jequié',
  'Teixeira de Freitas',
  'Alagoinhas',
  'Barreiras',
  'Porto Seguro',
  'Simões Filho',
  'Paulo Afonso',
  'Eunápolis',
  'Santo Antônio de Jesus',
  'Valença',
  'Candeias',
  'Guanambi',
  'Jacobina',
  'Serrinha',
  'Senhor do Bonfim',
  "Dias d'Ávila",
  'Campo Formoso',
  'Luís Eduardo Magalhães',
  'Cruz das Almas',
  'Brumado',
  'Irecê',
  'Itapetinga',
  'Conceição do Coité',
  'Mucuri',
  'Santo Amaro',
  'Itamaraju',
  'Ribeira do Pombal',
  'Bom Jesus da Lapa',
  'Casa Nova',
  'Madre de Deus',
  'Catu',
  'Tucano',
  'Euclides da Cunha',
  'Ipiaú',
  'Itaberaba',
  'Mata de São João',
  'Cachoeira',
  'São Sebastião do Passé',
  'Conceição do Jacuípe',
  'Entre Rios',
  'Vera Cruz',
  'Amélia Rodrigues',
];

function mapContractType(employmentType: string): ContractType {
  const typeMap: Record<string, ContractType> = {
    FULLTIME: ContractType.CLT,
    PARTTIME: ContractType.PJ,
    CONTRACTOR: ContractType.PJ,
    TEMPORARY: ContractType.TEMPORARY,
    INTERN: ContractType.INTERN,
    FREELANCE: ContractType.FREELANCE,
  };
  return typeMap[employmentType?.toUpperCase()] ?? ContractType.CLT;
}

function mapExperienceLevel(experienceMonths: number | undefined): ExperienceLevel {
  if (!experienceMonths || experienceMonths < 6) return ExperienceLevel.INTERN;
  if (experienceMonths < 24) return ExperienceLevel.JUNIOR;
  if (experienceMonths < 48) return ExperienceLevel.MID;
  if (experienceMonths < 84) return ExperienceLevel.SENIOR;
  return ExperienceLevel.SPECIALIST;
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

export type JsearchImportResponse = {
  success: boolean;
  message: string;
  imported: number;
  skipped?: number;
  total_found?: number;
  city_searched?: string;
  error?: string;
};

@Injectable()
export class JsearchImportService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    private readonly config: ConfigService,
  ) {}

  async importFromJSearch(): Promise<JsearchImportResponse> {
    const rapidKey = this.config.get<string>('RAPIDAPI_KEY');
    if (!rapidKey?.trim()) {
      throw new BadRequestException('RAPIDAPI_KEY não configurada');
    }

    const cityIndex = Math.floor(Math.random() * BAHIA_CITIES.length);
    const city = BAHIA_CITIES[cityIndex];

    const searchUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
      'vagas ' + city + ' Bahia Brasil',
    )}&page=1&num_pages=3&country=br`;

    let allJobs: JSearchJob[] = [];
    try {
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      });

      if (!response.ok) {
        const statusCode = response.status;
        if (statusCode === 429 || statusCode === 403) {
          throw new HttpException(
            {
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
              message:
                'Limite de buscas da API atingido. Aguarde até o próximo ciclo de renovação do plano (mensal).',
              error: 'QUOTA_EXCEEDED',
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        throw new Error(`API retornou status ${statusCode}`);
      }

      const data = (await response.json()) as { data?: JSearchJob[] };
      if (data.data && Array.isArray(data.data)) {
        const bahiaJobs = data.data.filter((job: JSearchJob) => {
          const state = job.job_state?.toLowerCase() || '';
          const jobCity = job.job_city?.toLowerCase() || '';
          return (
            state.includes('bahia') ||
            state === 'ba' ||
            BAHIA_CITIES.some((c) => jobCity.includes(c.toLowerCase()))
          );
        });
        allJobs = bahiaJobs;
      }
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Falha ao consultar JSearch',
      );
    }

    const uniqueJobs = allJobs.reduce((acc: JSearchJob[], job: JSearchJob) => {
      if (!acc.find((j) => j.job_id === job.job_id)) acc.push(job);
      return acc;
    }, []);

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

    const jobsToInsert = uniqueJobs.map((job: JSearchJob) => ({
      title: job.job_title,
      description: job.job_description || 'Descrição não disponível',
      location: `${job.job_city || city}, ${job.job_state || 'Bahia'}`,
      company_id: defaultCompany.id,
      contract_type: mapContractType(job.job_employment_type),
      experience_level: mapExperienceLevel(
        job.job_required_experience?.required_experience_in_months,
      ),
      remote_option: job.job_is_remote || false,
      category: extractCategory(job.job_title),
      salary_min: job.job_min_salary ?? null,
      salary_max: job.job_max_salary ?? null,
      status: JobStatus.ACTIVE,
      external_url: job.job_apply_link ?? null,
    }));

    if (jobsToInsert.length === 0) {
      return {
        success: true,
        message: `Nenhuma vaga encontrada em ${city}`,
        imported: 0,
        city_searched: city,
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
        message: `Nenhuma vaga nova em ${city} (${skippedCount} já existiam)`,
        imported: 0,
        skipped: skippedCount,
        city_searched: city,
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
      message: `${inserted.length} vagas importadas de ${city}${skippedCount > 0 ? ` (${skippedCount} ignoradas)` : ''}`,
      imported: inserted.length,
      skipped: skippedCount,
      total_found: uniqueJobs.length,
      city_searched: city,
    };
  }
}
