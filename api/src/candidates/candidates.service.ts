import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service.js';
import { Application } from '../entities/application.entity.js';
import { CandidateProfile } from '../entities/candidate-profile.entity.js';
import type { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto.js';

/**
 * Perfil de candidato autenticado e candidaturas (substitui leituras/escritas diretas no Supabase).
 */
@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(CandidateProfile)
    private readonly candidateRepo: Repository<CandidateProfile>,
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
    private readonly authService: AuthService,
  ) {}

  async getProfileByUserId(userId: string): Promise<CandidateProfile | null> {
    return this.candidateRepo.findOne({ where: { user_id: userId } });
  }

  toPublicProfile(profile: CandidateProfile): Record<string, unknown> {
    return {
      id: profile.id,
      user_id: profile.user_id,
      full_name: profile.full_name,
      phone: profile.phone,
      resume_url: profile.resume_url,
      bio: profile.bio,
      skills: profile.skills,
      linkedin_url: profile.linkedin_url,
      created_at:
        profile.created_at instanceof Date
          ? profile.created_at.toISOString()
          : profile.created_at,
      updated_at:
        profile.updated_at instanceof Date
          ? profile.updated_at.toISOString()
          : profile.updated_at,
    };
  }

  async updateMyProfile(
    userId: string,
    dto: UpdateCandidateProfileDto,
  ): Promise<Record<string, unknown>> {
    const { userRole } = await this.authService.resolveUserAccess(userId);
    if (userRole !== 'candidate') {
      throw new ForbiddenException('Apenas candidatos podem editar este perfil.');
    }

    const profile = await this.getProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado.');
    }

    await this.candidateRepo.update(profile.id, {
      full_name: dto.full_name ?? profile.full_name,
      phone: dto.phone !== undefined ? dto.phone : profile.phone,
      bio: dto.bio !== undefined ? dto.bio : profile.bio,
      linkedin_url:
        dto.linkedin_url !== undefined ? dto.linkedin_url : profile.linkedin_url,
    });

    const fresh = await this.getProfileByUserId(userId);
    return this.toPublicProfile(fresh!);
  }

  async listMyApplications(
    userId: string,
    page = 1,
    limit = 5,
  ): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { userRole } = await this.authService.resolveUserAccess(userId);
    if (userRole !== 'candidate') {
      throw new ForbiddenException('Apenas candidatos.');
    }

    const profile = await this.getProfileByUserId(userId);
    if (!profile) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    const total = await this.appRepo.count({
      where: { candidate_id: profile.id },
    });

    const rows = await this.appRepo.find({
      where: { candidate_id: profile.id },
      relations: ['job', 'job.company'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: rows.map((app) => this.serializeApplication(app)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  private serializeApplication(app: Application): Record<string, unknown> {
    const j = app.job;
    return {
      id: app.id,
      status: app.status,
      created_at:
        app.created_at instanceof Date
          ? app.created_at.toISOString()
          : app.created_at,
      cover_letter: app.cover_letter,
      jobs: j
        ? {
            id: j.id,
            title: j.title,
            location: j.location,
            companies: j.company
              ? {
                  name: j.company.name,
                  logo_url: j.company.logo_url,
                }
              : null,
          }
        : null,
    };
  }
}
