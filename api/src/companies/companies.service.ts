import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service.js';
import { Company } from '../entities/company.entity.js';
import type { UpdateCompanyProfileDto } from './dto/update-company-profile.dto.js';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly authService: AuthService,
  ) {}

  /**
   * Empresa vinculada ao usuário (painel empresa). Exige papel `company`.
   */
  async requireCompanyForUser(userId: string): Promise<Company> {
    const { userRole } = await this.authService.resolveUserAccess(userId);
    if (userRole !== 'company') {
      throw new ForbiddenException('Apenas contas de empresa.');
    }
    const company = await this.companyRepo.findOne({
      where: { user_id: userId },
    });
    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }
    return company;
  }

  async getMeSerialized(userId: string): Promise<Record<string, unknown>> {
    const company = await this.requireCompanyForUser(userId);
    return this.serializeCompany(company);
  }

  async updateProfile(
    userId: string,
    dto: UpdateCompanyProfileDto,
  ): Promise<Record<string, unknown>> {
    const company = await this.requireCompanyForUser(userId);

    let cnpjStored: string | null = null;
    if (!dto.is_freelancer) {
      const digits = (dto.cnpj ?? '').replace(/\D/g, '');
      if (digits.length !== 14) {
        throw new BadRequestException(
          'CNPJ é obrigatório para empresas (14 dígitos). Valide o CNPJ antes de salvar.',
        );
      }
      cnpjStored = digits;
    }

    await this.companyRepo.update(company.id, {
      name: dto.name,
      description: dto.description ?? null,
      location: dto.location ?? null,
      website: dto.website ?? null,
      phone: dto.phone ?? null,
      cnpj: cnpjStored,
      is_freelancer: dto.is_freelancer,
      is_verified: true,
    });

    const fresh = await this.companyRepo.findOne({ where: { id: company.id } });
    return this.serializeCompany(fresh!);
  }

  serializeCompany(c: Company): Record<string, unknown> {
    return {
      id: c.id,
      user_id: c.user_id,
      name: c.name,
      description: c.description,
      logo_url: c.logo_url,
      website: c.website,
      location: c.location,
      cnpj: c.cnpj,
      is_freelancer: c.is_freelancer,
      is_verified: c.is_verified,
      phone: c.phone,
      created_at:
        c.created_at instanceof Date
          ? c.created_at.toISOString()
          : c.created_at,
      updated_at:
        c.updated_at instanceof Date
          ? c.updated_at.toISOString()
          : c.updated_at,
    };
  }
}
