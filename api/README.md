# 🟦 BahiaVagas API

> Backend NestJS que atua como camada intermediária entre o frontend React e o Supabase.

## Quick Start

```bash
# 1. Instalar dependências
cd api
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves (veja .env.example para instruções)

# 3. Iniciar servidor de desenvolvimento
npm run start:dev

# 4. Acessar Swagger
# http://localhost:3000/api/docs
```

## Por que este backend existe?

O frontend React do BahiaVagas se comunicava **diretamente** com o Supabase usando a `anon_key` exposta no browser. Isso criava:

- 🔴 **Risco de segurança**: chaves expostas, queries diretas ao banco
- 🔴 **Acoplamento**: frontend amarrado ao Supabase SDK
- 🔴 **Ausência de business logic centralizada**: regras distribuídas no frontend

Este backend resolve tudo isso:

```
ANTES:  [React] ──anon_key──> [Supabase]
DEPOIS: [React] ──REST API──> [NestJS] ──service_role──> [Supabase]
```

## Estrutura

```
api/
├── src/
│   ├── main.ts                    # Bootstrap (Swagger, CORS, validation)
│   ├── app.module.ts              # Root module
│   ├── config/                    # Supabase client factory
│   ├── common/                    # Guards, filters, interceptors, decorators
│   ├── health/                    # GET /api/health
│   ├── auth/                      # Autenticação (proxy Supabase Auth)
│   ├── jobs/                      # Vagas de emprego (CRUD + busca + import)
│   ├── companies/                 # Empresas
│   ├── candidates/                # Candidatos
│   ├── applications/              # Candidaturas
│   ├── blog/                      # Blog posts
│   ├── analytics/                 # Tracking e dashboard
│   ├── seo/                       # Meta tags e sitemap
│   ├── integrations/              # CNPJ validation
│   └── storage/                   # Upload de currículos
├── docs/                          # Documentação técnica
│   ├── business-rules.md          # Regras de negócio explícitas
│   ├── api-mapping.md             # Mapa: Frontend → Endpoint → Supabase
│   ├── migration-log.md           # Log de cada arquivo migrado
│   └── adr/                       # Architecture Decision Records
├── .env.example                   # Template de variáveis
├── CHANGELOG.md                   # Histórico de mudanças
└── package.json
```

## Scripts

| Script | Comando | Descrição |
|---|---|---|
| `start:dev` | `nest start --watch` | Dev server com hot reload |
| `start:prod` | `node dist/main` | Produção |
| `build` | `nest build` | Build do projeto |
| `lint` | `eslint --fix` | Linting |
| `test` | `jest` | Testes unitários |

## Documentação

- **Swagger/OpenAPI**: `http://localhost:3000/api/docs` (interativo)
- **Regras de negócio**: [docs/business-rules.md](docs/business-rules.md)
- **Mapa de endpoints**: [docs/api-mapping.md](docs/api-mapping.md)
- **Log de migração**: [docs/migration-log.md](docs/migration-log.md)

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PORT` | Não | Porta do servidor (default: 3000) |
| `SUPABASE_URL` | ✅ | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Chave service_role (NUNCA expor!) |
| `RAPIDAPI_KEY` | Não | Chave JSearch para importação de vagas |
| `ANALYTICS_IP_SALT` | Não | Salt para hash de IP no analytics |

## Licença

Projeto privado — todos os direitos reservados.
