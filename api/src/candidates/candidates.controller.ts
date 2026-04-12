import {
  Body,
  Controller,
  Get,
  Patch,
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
import { AuthService } from '../auth/auth.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { JwtValidatedUser } from '../auth/strategies/jwt.strategy.js';
import { CandidatesService } from './candidates.service.js';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto.js';

@ApiTags('Candidates')
@Controller('api/candidates')
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly authService: AuthService,
  ) {}

  @Get('me/applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Candidaturas do candidato logado (paginado)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  async myApplications(
    @Req() req: Request & { user: JwtValidatedUser },
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(limitStr ?? '5', 10) || 5),
    );
    await this.authService.ensureUserProfileFromJwtUser(req.user);
    return this.candidatesService.listMyApplications(
      req.user.userId,
      page,
      limit,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Perfil do candidato logado' })
  @ApiResponse({ status: 200, description: 'Perfil ou null se não existir' })
  @ApiResponse({ status: 401 })
  async me(@Req() req: Request & { user: JwtValidatedUser }) {
    await this.authService.ensureUserProfileFromJwtUser(req.user);
    const profile = await this.candidatesService.getProfileByUserId(
      req.user.userId,
    );
    if (!profile) {
      return null;
    }
    return this.candidatesService.toPublicProfile(profile);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Atualizar perfil do candidato' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  patchMe(
    @Req() req: Request & { user: JwtValidatedUser },
    @Body() dto: UpdateCandidateProfileDto,
  ) {
    return this.candidatesService.updateMyProfile(req.user.userId, dto);
  }
}
