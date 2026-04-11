/**
 * AppModule — Root module do BahiaVagas API.
 *
 * Importa:
 * - ConfigModule: variáveis de ambiente
 * - TypeOrmModule: conexão PostgreSQL + entities
 * - ThrottlerModule: rate limiting global
 * - SupabaseModule: acesso ao Supabase Auth via SDK
 * - HealthController: verificação de status
 *
 * O TypeORM conecta DIRETAMENTE ao PostgreSQL do Supabase via DATABASE_URL.
 * O SupabaseModule é usado apenas para Auth (signup/signin/verify).
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { SupabaseModule } from './config/supabase.module.js';
import { HealthController } from './health/health.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { CandidatesModule } from './candidates/candidates.module.js';
import { CompaniesModule } from './companies/companies.module.js';
import { AdminModule } from './admin/admin.module.js';
import { IntegrationsModule } from './integrations/integrations.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { BlogModule } from './blog/blog.module.js';
import { MetaTagsModule } from './meta-tags/meta-tags.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';

// Entities
import {
  Company,
  Job,
  CandidateProfile,
  Application,
  UserRole,
  BlogPost,
  MetaTag,
  AnalyticsVisitor,
  AnalyticsSession,
  AnalyticsPageView,
} from './entities/index.js';

@Module({
  imports: [
    // ── Environment Variables ────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── TypeORM — Conexão ao PostgreSQL ──────────────────────
    // Conecta ao PostgreSQL do Supabase via DATABASE_URL.
    // `synchronize: true` é usado APENAS em desenvolvimento para
    // criar/atualizar tabelas automaticamente baseado nas entities.
    // Em PRODUÇÃO, usar migrations.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        url: configService.get<string>('DATABASE_URL'),
        entities: [
          Company,
          Job,
          CandidateProfile,
          Application,
          UserRole,
          BlogPost,
          MetaTag,
          AnalyticsVisitor,
          AnalyticsSession,
          AnalyticsPageView,
        ],
        // ⚠️ synchronize: true cria/altera tabelas automaticamente.
        // Desabilitar em produção e usar migrations.
        synchronize: true,
        logging: configService.get('NODE_ENV') !== 'production',
        // SSL obrigatório para Supabase
        ssl: { rejectUnauthorized: false },
      }),
    }),

    // ── Rate Limiting Global ─────────────────────────────────
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),

    // ── Supabase Client (para Auth apenas) ───────────────────
    SupabaseModule,

    AuthModule,
    JobsModule,
    CandidatesModule,
    CompaniesModule,
    AdminModule,
    IntegrationsModule,
    ApplicationsModule,
    BlogModule,
    MetaTagsModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
