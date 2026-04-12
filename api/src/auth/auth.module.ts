import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseModule } from '../config/supabase.module.js';
import { CandidateProfile } from '../entities/candidate-profile.entity.js';
import { Company } from '../entities/company.entity.js';
import { UserRole } from '../entities/user-role.entity.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { AdminGuard } from './guards/admin.guard.js';

/**
 * Módulo de autenticação: signup/login/logout/me + validação Bearer via Supabase (`getUser`).
 */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([CandidateProfile, Company, UserRole]),
    SupabaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, AdminGuard],
  exports: [AuthService, JwtAuthGuard, AdminGuard],
})
export class AuthModule {}
