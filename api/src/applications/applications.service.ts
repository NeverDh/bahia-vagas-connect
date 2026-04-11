import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service.js';
import { SupabaseService } from '../config/supabase.service.js';
import { Application } from '../entities/application.entity.js';
import { CandidateProfile } from '../entities/candidate-profile.entity.js';
import { Job, JobStatus } from '../entities/job.entity.js';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXT = new Set(['pdf', 'doc', 'docx']);

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(CandidateProfile)
    private readonly candidateRepo: Repository<CandidateProfile>,
    private readonly authService: AuthService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async submitWithResume(
    userId: string,
    jobId: string,
    coverLetter: string | undefined,
    file: Express.Multer.File | undefined,
  ): Promise<{ ok: true; application_id: string }> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Currículo é obrigatório.');
    }

    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de arquivo inválido. Use PDF ou DOC/DOCX.',
      );
    }

    const ext = (file.originalname.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      throw new BadRequestException(
        'Extensão inválida. Use .pdf, .doc ou .docx.',
      );
    }

    const { userRole } = await this.authService.resolveUserAccess(userId);
    if (userRole !== 'candidate') {
      throw new ForbiddenException('Apenas candidatos podem se candidatar.');
    }

    const profile = await this.candidateRepo.findOne({
      where: { user_id: userId },
    });
    if (!profile) {
      throw new NotFoundException('Perfil de candidato não encontrado.');
    }

    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    if (job.status !== JobStatus.ACTIVE) {
      throw new BadRequestException(
        'Esta vaga não está aceitando candidaturas.',
      );
    }

    const existing = await this.appRepo.findOne({
      where: { job_id: jobId, candidate_id: profile.id },
    });
    if (existing) {
      throw new ConflictException('Você já se candidatou a esta vaga.');
    }

    const storagePath = `${userId}/${Date.now()}.${ext}`;
    const client = this.supabaseService.getAdminClient();

    const { error: uploadError } = await client.storage
      .from('resumes')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      this.logger.warn(`Storage upload failed: ${uploadError.message}`);
      throw new BadRequestException('Falha ao enviar currículo.');
    }

    const { data: pub } = client.storage
      .from('resumes')
      .getPublicUrl(storagePath);
    const resumeUrl = pub.publicUrl;

    await this.candidateRepo.update(profile.id, { resume_url: resumeUrl });

    const application = await this.appRepo.save(
      this.appRepo.create({
        job_id: jobId,
        candidate_id: profile.id,
        cover_letter: coverLetter?.trim() || null,
        status: 'pending',
      }),
    );

    return { ok: true, application_id: application.id };
  }
}
