# Changelog

Todas as mudanças notáveis no BahiaVagas API são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [Unreleased]

### Added
- Setup inicial do projeto NestJS
- Configuração de Swagger/OpenAPI em `/api/docs`
- Módulo Supabase com service_role client
- CORS configurado para bahiavagas.com + localhost
- Helmet para security headers
- ThrottlerModule para rate limiting global (100 req/min)
- ValidationPipe global com whitelist
- HttpExceptionFilter com formato padronizado de erro
- LoggingInterceptor com tempo de resposta
- `GET /api/health` — health check
- Documentação: README.md, .env.example, ADR-001, business-rules.md, api-mapping.md, migration-log.md
