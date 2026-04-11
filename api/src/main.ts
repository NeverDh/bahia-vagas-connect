/**
 * BahiaVagas API — Entry Point
 *
 * Inicializa o servidor NestJS com Swagger, CORS, validação global
 * e exception filter padronizado.
 *
 * @see docs/adr/001-nestjs-proxy.md — Decisão arquitetural
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Security Headers ───────────────────────────────────────
  app.use(helmet());

  // ── CORS ───────────────────────────────────────────────────
  // Permite requisições do frontend (produção + desenvolvimento)
  app.enableCors({
    origin: [
      'https://bahiavagas.com',
      'https://www.bahiavagas.com',
      'http://localhost:8080',  // Vite dev server
      'http://localhost:5173',  // Vite alt port
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Global Pipes ───────────────────────────────────────────
  // Valida DTOs automaticamente usando class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // Remove propriedades não declaradas no DTO
      forbidNonWhitelisted: true, // Rejeita requests com props extras
      transform: true,        // Transforma payloads em instâncias de DTO
      transformOptions: {
        enableImplicitConversion: true, // Converte query params automaticamente
      },
    }),
  );

  // ── Global Filters & Interceptors ──────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ── Swagger / OpenAPI ──────────────────────────────────────
  // Documentação interativa acessível em /api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BahiaVagas API')
    .setDescription(
      'API REST do BahiaVagas — camada intermediária entre o frontend React e o Supabase. ' +
      'Centraliza autenticação, business logic, validação e controle de acesso.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('Health', 'Health check do servidor')
    .addTag('Auth', 'Autenticação (signup, login, logout)')
    .addTag('Jobs', 'Vagas de emprego (CRUD, busca, importação)')
    .addTag('Admin', 'Painel administrativo')
    .addTag('Companies', 'Empresas (CRUD)')
    .addTag('Candidates', 'Perfis de candidatos')
    .addTag('Applications', 'Candidaturas (envio e gestão)')
    .addTag('Blog', 'Blog posts (CRUD)')
    .addTag('Analytics', 'Rastreamento de visitas e dashboard')
    .addTag('SEO', 'Meta tags e sitemap')
    .addTag('Integrations', 'Serviços externos (CNPJ)')
    .addTag('Storage', 'Upload/download de arquivos')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // ── Start Server ───────────────────────────────────────────
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 BahiaVagas API running on http://localhost:${port}`);
  console.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
