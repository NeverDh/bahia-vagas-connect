import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity.js';
import { Job } from '../entities/job.entity.js';
import { Application } from '../entities/application.entity.js';
import { CandidateProfile } from '../entities/candidate-profile.entity.js';
import { JobsService } from '../jobs/jobs.service.js';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
    @InjectRepository(CandidateProfile)
    private readonly candidateRepo: Repository<CandidateProfile>,
    private readonly jobsService: JobsService,
  ) {}

  async dashboard(): Promise<{
    jobs: Record<string, unknown>[];
    companies: Record<string, unknown>[];
    stats: {
      jobs: number;
      companies: number;
      applications: number;
      candidates: number;
    };
  }> {
    const [
      jobs,
      companies,
      totalJobs,
      totalCompanies,
      applications,
      candidates,
    ] = await Promise.all([
      this.jobsService.listForAdmin(50),
      this.companyRepo.find({
        order: { created_at: 'DESC' },
        take: 50,
      }),
      this.jobRepo.count(),
      this.companyRepo.count(),
      this.appRepo.count(),
      this.candidateRepo.count(),
    ]);

    return {
      jobs,
      companies: companies.map((c) => this.serializeAdminCompany(c)),
      stats: {
        jobs: totalJobs,
        companies: totalCompanies,
        applications,
        candidates,
      },
    };
  }

  async deleteCompany(id: string): Promise<{ ok: true }> {
    const res = await this.companyRepo.delete(id);
    if (!res.affected) {
      throw new NotFoundException('Empresa não encontrada.');
    }
    return { ok: true };
  }

  async listCandidatesPaginated(
    page = 1,
    limit = 20,
  ): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const qb = this.candidateRepo
      .createQueryBuilder('c')
      .orderBy('c.created_at', 'DESC');
    const total = await qb.getCount();
    const rows = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    return {
      data: rows.map((c) => ({
        id: c.id,
        user_id: c.user_id,
        full_name: c.full_name,
        phone: c.phone,
        resume_url: c.resume_url,
        created_at:
          c.created_at instanceof Date
            ? c.created_at.toISOString()
            : c.created_at,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async listApplicationsPaginated(
    page = 1,
    limit = 20,
  ): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const qb = this.appRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.job', 'job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('a.candidate', 'candidate')
      .orderBy('a.created_at', 'DESC');
    const total = await qb.getCount();
    const rows = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    return {
      data: rows.map((a) => {
        const j = a.job;
        const co = j?.company;
        const cand = a.candidate;
        return {
          id: a.id,
          status: a.status,
          created_at:
            a.created_at instanceof Date
              ? a.created_at.toISOString()
              : a.created_at,
          job: j
            ? {
                id: j.id,
                title: j.title,
                location: j.location,
              }
            : null,
          company: co ? { name: co.name } : null,
          candidate: cand
            ? { id: cand.id, full_name: cand.full_name }
            : null,
        };
      }),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async setCompanyVerification(
    id: string,
    isVerified: boolean,
  ): Promise<Record<string, unknown>> {
    const res = await this.companyRepo.update(id, { is_verified: isVerified });
    if (!res.affected) {
      throw new NotFoundException('Empresa não encontrada.');
    }
    const company = await this.companyRepo.findOne({ where: { id } });
    return this.serializeAdminCompany(company!);
  }

  private serializeAdminCompany(c: Company): Record<string, unknown> {
    return {
      id: c.id,
      name: c.name,
      location: c.location,
      is_verified: c.is_verified,
      created_at:
        c.created_at instanceof Date
          ? c.created_at.toISOString()
          : c.created_at,
    };
  }
}
