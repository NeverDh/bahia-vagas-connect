import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { JwtValidatedUser } from '../auth/strategies/jwt.strategy.js';
import { JobsService } from '../jobs/jobs.service.js';
import { CreateCompanyJobDto } from '../jobs/dto/create-company-job.dto.js';
import { UpdateCompanyJobDto } from '../jobs/dto/update-company-job.dto.js';
import { PatchJobStatusDto } from '../jobs/dto/patch-job-status.dto.js';
import { CompaniesService } from './companies.service.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto.js';

@ApiTags('Companies')
@Controller('api/companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly jobsService: JobsService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Dados da empresa do usuário logado' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  getMe(@Req() req: Request & { user: JwtValidatedUser }) {
    return this.companiesService.getMeSerialized(req.user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar perfil da empresa' })
  @ApiResponse({ status: 200 })
  patchMe(
    @Req() req: Request & { user: JwtValidatedUser },
    @Body() dto: UpdateCompanyProfileDto,
  ) {
    return this.companiesService.updateProfile(req.user.userId, dto);
  }

  @Get('me/jobs')
  @ApiOperation({ summary: 'Listar vagas da minha empresa (paginado)' })
  listMyJobs(
    @Req() req: Request & { user: JwtValidatedUser },
    @Query() q: PaginationQueryDto,
  ) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 10;
    return this.companiesService
      .requireCompanyForUser(req.user.userId)
      .then((c) => this.jobsService.listByCompany(c.id, page, limit));
  }

  @Get('me/jobs/:jobId')
  @ApiOperation({ summary: 'Detalhe de uma vaga da minha empresa (edição)' })
  getMyJob(
    @Req() req: Request & { user: JwtValidatedUser },
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.jobsService.getJobForCompanyOwner(req.user.userId, jobId);
  }

  @Post('me/jobs')
  @ApiOperation({ summary: 'Criar vaga (empresa verificada)' })
  @ApiResponse({ status: 201 })
  async createMyJob(
    @Req() req: Request & { user: JwtValidatedUser },
    @Body() dto: CreateCompanyJobDto,
  ) {
    const company = await this.companiesService.requireCompanyForUser(
      req.user.userId,
    );
    return this.jobsService.createCompanyJob(company, dto);
  }

  @Patch('me/jobs/:jobId')
  @ApiOperation({ summary: 'Atualizar vaga da minha empresa' })
  updateMyJob(
    @Req() req: Request & { user: JwtValidatedUser },
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() dto: UpdateCompanyJobDto,
  ) {
    return this.jobsService.updateCompanyJobForUser(
      req.user.userId,
      jobId,
      dto,
    );
  }

  @Patch('me/jobs/:jobId/status')
  @ApiOperation({ summary: 'Alternar status active/closed' })
  patchMyJobStatus(
    @Req() req: Request & { user: JwtValidatedUser },
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() dto: PatchJobStatusDto,
  ) {
    return this.jobsService.patchCompanyJobStatusForUser(
      req.user.userId,
      jobId,
      dto,
    );
  }

  @Delete('me/jobs/:jobId')
  @ApiOperation({ summary: 'Excluir vaga da minha empresa' })
  @ApiResponse({ status: 200 })
  deleteMyJob(
    @Req() req: Request & { user: JwtValidatedUser },
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.jobsService.deleteCompanyJobForUser(req.user.userId, jobId);
  }
}
