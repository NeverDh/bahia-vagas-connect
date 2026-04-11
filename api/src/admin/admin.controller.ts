import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { JobsService } from '../jobs/jobs.service.js';
import { AdminService } from './admin.service.js';
import { CompanyVerificationDto } from './dto/company-verification.dto.js';

@ApiTags('Admin')
@Controller('api/admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly jobsService: JobsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Snapshot do painel (vagas, empresas, contagens totais)',
  })
  @ApiResponse({ status: 200 })
  getDashboard() {
    return this.adminService.dashboard();
  }

  @Get('candidates')
  @ApiOperation({
    summary: 'Listar perfis de candidatos (paginado, Módulo 5)',
  })
  @ApiResponse({ status: 200 })
  listCandidates(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(limitStr ?? '20', 10) || 20),
    );
    return this.adminService.listCandidatesPaginated(page, limit);
  }

  @Get('applications')
  @ApiOperation({
    summary: 'Listar candidaturas com vaga e candidato (paginado, Módulo 5)',
  })
  @ApiResponse({ status: 200 })
  listApplications(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(limitStr ?? '20', 10) || 20),
    );
    return this.adminService.listApplicationsPaginated(page, limit);
  }

  @Delete('jobs/:id')
  @ApiOperation({ summary: 'Remover vaga (admin)' })
  @ApiResponse({ status: 200 })
  deleteJob(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.deleteJobByAdmin(id);
  }

  @Delete('companies/:id')
  @ApiOperation({ summary: 'Remover empresa (admin)' })
  @ApiResponse({ status: 200 })
  deleteCompany(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteCompany(id);
  }

  @Patch('companies/:id/verification')
  @ApiOperation({ summary: 'Alterar flag is_verified' })
  patchCompanyVerification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompanyVerificationDto,
  ) {
    return this.adminService.setCompanyVerification(id, dto.is_verified);
  }
}
