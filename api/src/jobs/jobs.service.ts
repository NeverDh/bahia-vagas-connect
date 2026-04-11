import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  ILike,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { AuthService } from '../auth/auth.service.js';
import {
  Job,
  JobStatus,
  ContractType,
} from '../entities/job.entity.js';
import type { Company } from '../entities/company.entity.js';
import { Application } from '../entities/application.entity.js';
import { CandidateProfile } from '../entities/candidate-profile.entity.js';
import { QueryJobsDto } from './dto/query-jobs.dto.js';
import type { CreateCompanyJobDto } from './dto/create-company-job.dto.js';
import type { UpdateCompanyJobDto } from './dto/update-company-job.dto.js';
import type { PatchJobStatusDto } from './dto/patch-job-status.dto.js';

const EXP_TITLE_KEYWORDS: Record<string, string[]> = {
  auxiliar: ['auxiliar'],
  assistente: ['assistente'],
  intern: ['estágio', 'estagiário', 'estagiario'],
};

export type PublicJobJson = Record<string, unknown>;

/**
 * Listagem e leitura pública de vagas + utilitários para candidato (IDs já candidatados).
 */
@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
    @InjectRepository(CandidateProfile)
    private readonly candidateRepo: Repository<CandidateProfile>,
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
  ) {}

  async list(dto: QueryJobsDto): Promise<{
    data: PublicJobJson[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.jobRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .where('job.status = :status', { status: JobStatus.ACTIVE });

    const searchIds = await this.resolveSearchJobIds(dto.search);
    if (searchIds !== null) {
      if (searchIds.length === 0) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
      qb.andWhere('job.id IN (:...sids)', { sids: searchIds });
    }

    if (dto.remote_only) {
      qb.andWhere('job.remote_option = :ro', { ro: true });
    }

    if (dto.contract_types?.trim()) {
      const types = dto.contract_types
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (types.length) {
        qb.andWhere('job.contract_type IN (:...ctypes)', { ctypes: types });
      }
    }

    if (dto.experience_levels?.trim()) {
      const levels = dto.experience_levels
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (levels.length) {
        this.applyExperienceOrFilter(qb, levels);
      }
    }

    if (dto.location?.trim()) {
      qb.andWhere('job.location ILIKE :loc', {
        loc: `%${dto.location.trim()}%`,
      });
    }

    if (dto.title_keywords?.trim()) {
      const kws = dto.title_keywords
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (kws.length) {
        qb.andWhere(
          new Brackets((qb2) => {
            kws.forEach((kw, i) => {
              const p = `tkw${i}`;
              qb2.orWhere(`job.title ILIKE :${p}`, { [p]: `%${kw}%` });
            });
          }),
        );
      }
    }

    const order = dto.sort === 'oldest' ? 'ASC' : 'DESC';
    qb.orderBy('job.created_at', order);

    const total = await qb.clone().getCount();
    qb.skip((page - 1) * limit).take(limit);
    const rows = await qb.getMany();

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: rows.map((j) => this.serializePublicJob(j)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOneActive(id: string): Promise<PublicJobJson> {
    const job = await this.jobRepo.findOne({
      where: { id, status: JobStatus.ACTIVE },
      relations: ['company'],
    });
    if (!job) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    return this.serializePublicJob(job);
  }

  async getAppliedJobIds(userId: string): Promise<{ jobIds: string[] }> {
    const profile = await this.candidateRepo.findOne({
      where: { user_id: userId },
    });
    if (!profile) {
      return { jobIds: [] };
    }
    const apps = await this.appRepo.find({
      where: { candidate_id: profile.id },
      select: ['job_id'],
    });
    return { jobIds: apps.map((a) => a.job_id) };
  }

  async getFeaturedCarousel(): Promise<{
    recent: { id: string; title: string; location: string; company_name: string | null }[];
    popular: { id: string; title: string; location: string; company_name: string | null }[];
  }> {
    const recentJobs = await this.jobRepo.find({
      where: { status: JobStatus.ACTIVE },
      relations: ['company'],
      order: { created_at: 'DESC' },
      take: 12,
    });

    const popularRows = await this.dataSource.query<
      {
        id: string;
        title: string;
        location: string;
        companyName: string | null;
      }[]
    >(`
      SELECT j.id, j.title, j.location, c.name AS "companyName"
      FROM jobs j
      LEFT JOIN companies c ON c.id = j.company_id
      WHERE j.status = 'active'
      ORDER BY (
        SELECT COUNT(*)::int FROM applications a WHERE a.job_id = j.id
      ) DESC,
      j.created_at DESC
      LIMIT 12
    `);

    return {
      recent: recentJobs.map((j) => ({
        id: j.id,
        title: j.title,
        location: j.location,
        company_name: j.company?.name ?? null,
      })),
      popular: popularRows.map((r) => ({
        id: r.id,
        title: r.title,
        location: r.location,
        company_name: r.companyName,
      })),
    };
  }

  async recentByCity(
    cityName: string,
    lim: number,
  ): Promise<
    { id: string; title: string; created_at: string; company: { name: string } | null }[]
  > {
    const jobs = await this.jobRepo.find({
      where: {
        status: JobStatus.ACTIVE,
        location: ILike(`%${cityName}%`),
      },
      relations: ['company'],
      order: { created_at: 'DESC' },
      take: lim,
    });

    return jobs.map((j) => ({
      id: j.id,
      title: j.title,
      created_at:
        j.created_at instanceof Date
          ? j.created_at.toISOString()
          : String(j.created_at),
      company: j.company ? { name: j.company.name } : null,
    }));
  }

  private async resolveSearchJobIds(
    search?: string,
  ): Promise<string[] | null> {
    if (!search?.trim()) {
      return null;
    }
    const normalized = search.trim().replace(/,/g, ' ');
    const rows = await this.dataSource.query<Record<string, unknown>[]>(
      'SELECT * FROM public.search_jobs($1::text)',
      [normalized],
    );
    if (!rows?.length) {
      return [];
    }
    const col = Object.keys(rows[0])[0];
    return rows.map((r) => String(r[col]));
  }

  private applyExperienceOrFilter(
    qb: SelectQueryBuilder<Job>,
    levels: string[],
  ): void {
    qb.andWhere(
      new Brackets((qb2) => {
        qb2.where('job.experience_level IN (:...expLevels)', {
          expLevels: levels,
        });
        let idx = 0;
        for (const level of levels) {
          const kws = EXP_TITLE_KEYWORDS[level];
          if (!kws) continue;
          for (const kw of kws) {
            const p = `tkexp${idx++}`;
            qb2.orWhere(`job.title ILIKE :${p}`, { [p]: `%${kw}%` });
          }
        }
      }),
    );
  }

  /**
   * Lista paginada de vagas de uma empresa (painel da empresa).
   */
  async listByCompany(
    companyId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const qb = this.jobRepo
      .createQueryBuilder('job')
      .where('job.company_id = :cid', { cid: companyId })
      .orderBy('job.created_at', 'DESC');
    const total = await qb.getCount();
    const rows = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    return {
      data: rows.map((j) => this.serializeCompanyJob(j)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getJobForCompanyOwner(
    userId: string,
    jobId: string,
  ): Promise<Record<string, unknown>> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['company'],
    });
    if (!job?.company || job.company.user_id !== userId) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    return this.serializeCompanyJob(job);
  }

  async createCompanyJob(
    company: Company,
    dto: CreateCompanyJobDto,
  ): Promise<Record<string, unknown>> {
    if (!company.is_verified) {
      throw new BadRequestException(
        'Complete e verifique o perfil da empresa antes de publicar vagas.',
      );
    }
    this.assertFreelancerContractRules(company, dto.contract_type);
    const job = this.jobRepo.create({
      company_id: company.id,
      title: dto.title,
      description: dto.description,
      requirements: dto.requirements ?? null,
      benefits: dto.benefits ?? null,
      location: dto.location,
      category: dto.category,
      contract_type: dto.contract_type,
      experience_level: dto.experience_level,
      salary_min: dto.salary_min ?? null,
      salary_max: dto.salary_max ?? null,
      remote_option: dto.remote_option ?? false,
      status: dto.status ?? JobStatus.ACTIVE,
      external_url: null,
    });
    const saved = await this.jobRepo.save(job);
    return this.serializeCompanyJob(saved);
  }

  async updateCompanyJobForUser(
    userId: string,
    jobId: string,
    dto: UpdateCompanyJobDto,
  ): Promise<Record<string, unknown>> {
    const job = await this.assertJobWritableByUser(userId, jobId);
    const company = job.company;
    if (!company) {
      throw new NotFoundException('Empresa da vaga não encontrada.');
    }
    const effectiveContract = dto.contract_type ?? job.contract_type;
    this.assertFreelancerContractRules(company, effectiveContract);

    const patch: Partial<Job> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.requirements !== undefined) patch.requirements = dto.requirements;
    if (dto.benefits !== undefined) patch.benefits = dto.benefits;
    if (dto.location !== undefined) patch.location = dto.location;
    if (dto.category !== undefined) patch.category = dto.category;
    if (dto.contract_type !== undefined)
      patch.contract_type = dto.contract_type;
    if (dto.experience_level !== undefined)
      patch.experience_level = dto.experience_level;
    if (dto.salary_min !== undefined) patch.salary_min = dto.salary_min;
    if (dto.salary_max !== undefined) patch.salary_max = dto.salary_max;
    if (dto.remote_option !== undefined) patch.remote_option = dto.remote_option;

    await this.jobRepo.update(jobId, patch);
    const updated = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['company'],
    });
    return this.serializeCompanyJob(updated!);
  }

  async deleteCompanyJobForUser(
    userId: string,
    jobId: string,
  ): Promise<{ ok: true }> {
    await this.assertJobWritableByUser(userId, jobId);
    await this.jobRepo.delete(jobId);
    return { ok: true };
  }

  async patchCompanyJobStatusForUser(
    userId: string,
    jobId: string,
    dto: PatchJobStatusDto,
  ): Promise<Record<string, unknown>> {
    await this.assertJobWritableByUser(userId, jobId);
    await this.jobRepo.update(jobId, { status: dto.status });
    const updated = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['company'],
    });
    return this.serializeCompanyJob(updated!);
  }

  /** Últimas vagas (admin) com nome da empresa no formato legado do Supabase. */
  async listForAdmin(limit = 50): Promise<Record<string, unknown>[]> {
    const jobs = await this.jobRepo.find({
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['company'],
    });
    return jobs.map((j) => ({
      ...this.serializeCompanyJob(j),
      companies: j.company ? { name: j.company.name } : null,
    }));
  }

  async deleteJobByAdmin(jobId: string): Promise<{ ok: true }> {
    const res = await this.jobRepo.delete(jobId);
    if (!res.affected) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    return { ok: true };
  }

  private async assertJobWritableByUser(
    userId: string,
    jobId: string,
  ): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['company'],
    });
    if (!job) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    if (await this.authService.isAdminUser(userId)) {
      return job;
    }
    if (!job.company || job.company.user_id !== userId) {
      throw new ForbiddenException('Sem permissão para esta vaga.');
    }
    return job;
  }

  private assertFreelancerContractRules(
    company: Company,
    contractType: ContractType,
  ): void {
    if (!company.is_freelancer) return;
    const allowed = [ContractType.FREELANCE, ContractType.PJ];
    if (!allowed.includes(contractType)) {
      throw new BadRequestException(
        'Freelancers só podem publicar vagas do tipo Freelance ou PJ.',
      );
    }
  }

  serializeCompanyJob(job: Job): Record<string, unknown> {
    return {
      id: job.id,
      company_id: job.company_id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      salary_min: job.salary_min != null ? Number(job.salary_min) : null,
      salary_max: job.salary_max != null ? Number(job.salary_max) : null,
      location: job.location,
      contract_type: job.contract_type,
      experience_level: job.experience_level,
      status: job.status,
      category: job.category,
      remote_option: job.remote_option,
      external_url: job.external_url,
      created_at:
        job.created_at instanceof Date
          ? job.created_at.toISOString()
          : job.created_at,
      updated_at:
        job.updated_at instanceof Date
          ? job.updated_at.toISOString()
          : job.updated_at,
      expires_at: job.expires_at
        ? job.expires_at instanceof Date
          ? job.expires_at.toISOString()
          : job.expires_at
        : null,
    };
  }

  serializePublicJob(job: Job): PublicJobJson {
    const c = job.company;
    return {
      id: job.id,
      company_id: job.company_id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      salary_min: job.salary_min != null ? Number(job.salary_min) : null,
      salary_max: job.salary_max != null ? Number(job.salary_max) : null,
      location: job.location,
      contract_type: job.contract_type,
      experience_level: job.experience_level,
      status: job.status,
      category: job.category,
      remote_option: job.remote_option,
      external_url: job.external_url,
      created_at:
        job.created_at instanceof Date
          ? job.created_at.toISOString()
          : job.created_at,
      updated_at:
        job.updated_at instanceof Date
          ? job.updated_at.toISOString()
          : job.updated_at,
      expires_at: job.expires_at
        ? job.expires_at instanceof Date
          ? job.expires_at.toISOString()
          : job.expires_at
        : null,
      companies: c
        ? {
            name: c.name,
            logo_url: c.logo_url,
            description: c.description ?? undefined,
            website: c.website ?? undefined,
            location: c.location ?? undefined,
          }
        : undefined,
    };
  }
}
