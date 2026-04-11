import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { QueryJobsDto } from './dto/query-jobs.dto.js';
import { JobsService } from './jobs.service.js';

@ApiTags('Jobs')
@Controller('api/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('featured/carousel')
  @ApiOperation({ summary: 'Vagas recentes e populares (carrossel da home)' })
  @ApiResponse({ status: 200 })
  getFeaturedCarousel() {
    return this.jobsService.getFeaturedCarousel();
  }

  @Get('recent/city')
  @ApiOperation({ summary: 'Últimas vagas por cidade (blocos da home)' })
  @ApiResponse({ status: 200 })
  recentByCity(
    @Query('name') name: string,
    @Query('limit') limitStr?: string,
  ) {
    const lim = Math.min(Math.max(parseInt(limitStr ?? '5', 10) || 5, 1), 20);
    if (!name?.trim()) {
      return [];
    }
    return this.jobsService.recentByCity(name.trim(), lim);
  }

  @Get('candidate/applied-ids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'IDs das vagas às quais o candidato já se candidatou',
  })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  getAppliedIds(@Req() req: Request & { user: JwtValidatedUser }) {
    return this.jobsService.getAppliedJobIds(req.user.userId);
  }

  /** Listagem na raiz do recurso — deve ficar antes de `:id`. */
  @Get()
  @ApiOperation({
    summary: 'Listagem pública de vagas (filtros, busca, paginação)',
  })
  @ApiResponse({ status: 200 })
  list(@Query() query: QueryJobsDto) {
    return this.jobsService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de uma vaga ativa' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.findOneActive(id);
  }
}
