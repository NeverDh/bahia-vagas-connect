# Migration log — BahiaVagas (React → NestJS proxy)

Registro das fases de migração do frontend para a API NestJS. Complementa referências em `src/services/api.ts` e `.agent/ARCHITECTURE.md`.

## Inventário Explorer (2026-04-11)

- **`docs/supabase-frontend-migration-map.md`** — Mapeamento ponta a ponta: tabelas e arquivos no `src/`, Edge Functions, storage, RPC SQL, riscos e ordem sugerida de módulos Nest.

## Módulo 7 — Analytics + import JSearch (2026-04-11)

### Backend

- **`AnalyticsModule`**
  - `POST /api/analytics/track` — público; hash de IP com `ANALYTICS_IP_SALT` (default igual à Edge: `bahiavagas-salt-2026`); UA → device/browser/os; headers Cloudflare (`cf-ipcountry`, `cf-ipcity`, `cf-region`) quando presentes; upsert `analytics_visitors`, sessão (reutiliza `session_id` só se existir e for do mesmo visitante), insert `analytics_page_views`.
- **`AdminModule`** (extensão)
  - `GET /api/admin/analytics?since=` — JWT + admin; `since` ISO8601 opcional (default últimos 7 dias); retorno `{ visitors, sessions, page_views }` com datas em ISO (compatível com `Analytics.tsx`).
  - `POST /api/admin/jobs/import` — JWT + admin; lógica espelhada da Edge `import-jobs` (JSearch + RapidAPI); variável **`RAPIDAPI_KEY`** só no servidor; empresa padrão `Vagas Importadas`; 429 com corpo filtrado `error: QUOTA_EXCEEDED`.
- **`JsearchImportService`** (`api/src/jobs/jsearch-import.service.ts`); **`JobsModule`** passa a registrar `Company` + exportar o serviço de importação.

### Frontend

- **`src/lib/analytics-api.ts`** — `trackVisit`, `fetchAdminAnalytics`.
- **`useAnalyticsTracker.ts`**, **`Analytics.tsx`** — sem Supabase; tracking e dashboard via API.
- **`useImportJobs.ts`** — `POST /api/admin/jobs/import`; tratamento de `ApiRequestError` 429 / `QUOTA_EXCEEDED`.
- Removidos **`src/integrations/supabase/client.ts`** e a dependência **`@supabase/supabase-js`** do `package.json` raiz (o app não usa mais o SDK no browser).

### Variáveis de ambiente (`api/.env`)

- **`RAPIDAPI_KEY`** — obrigatória para import manual de vagas.
- **`ANALYTICS_IP_SALT`** — opcional (compatibilidade de hashes com dados já coletados se mantiver o default).

**Pendente neste domínio:** sitemap (Edge ou `GET /api/seo/sitemap.xml`); `POST /api/auth/refresh` se desejado.

## E-mail de autenticação — Supabase nativo (2026-04-11)

- **Objetivo:** deixar de depender da Lovable para envio transacional do Auth.
- **Ação no projeto Supabase (manual):** desativar o **Send Email Hook** que apontava para `auth-email-hook`; configurar **Authentication → URL Configuration** e **Email Templates**; opcionalmente **SMTP personalizado** em Project Settings.
- **Documentação:** `docs/supabase-auth-email.md`.
- **Código:** `supabase/functions/auth-email-hook/` marcada como legado (comentário no `index.ts`); não é necessário ao fluxo novo.

## Módulo 5 — Perfil candidato + candidaturas + multipart (2026-04-11)

### Backend

- **`CandidatesModule`** (extensão)
  - `GET /api/candidates/me` — resposta com datas em ISO (igual contrato anterior).
  - `PATCH /api/candidates/me` — `full_name`, `phone`, `bio`, `linkedin_url` (apenas papel `candidate`).
  - `GET /api/candidates/me/applications?page=&limit=` — lista com `jobs` + `companies` no formato esperado pelo `Profile.tsx`.
- **`ApplicationsModule`**
  - `POST /api/applications` — `multipart/form-data`: `job_id`, `resume` (arquivo), `cover_letter` opcional; JWT; upload no bucket Supabase `resumes` via **service role**; atualiza `candidate_profiles.resume_url`; insere `applications` (vaga `active`, sem duplicata).
- **`AdminModule`** (extensão Módulo 5)
  - `GET /api/admin/candidates?page=&limit=` — lista paginada de `candidate_profiles` (admin).
  - `GET /api/admin/applications?page=&limit=` — candidaturas com vaga, empresa e nome do candidato (admin).
- Dependência **`@types/multer`** no `api/` para tipagem de upload.

### Frontend

- **`src/services/api.ts`** — corpo `FormData` não força `Content-Type: application/json`; **`api.postFormData`**.
- **`src/lib/candidates-api.ts`** — perfil, candidaturas paginadas, `submitApplication`.
- **`src/lib/admin-api.ts`** — `fetchAdminCandidates`, `fetchAdminApplications` (rotas admin do Módulo 5).
- **`Profile.tsx`**, **`ApplicationForm.tsx`**, **`JobDetails.tsx`** — sem Supabase nestes fluxos; formulário de candidatura só precisa de `jobId` (candidato vem do JWT no servidor).

**Pendente neste domínio:** — (candidaturas migradas; blog/SEO/analytics/import nos Módulos 6–7).

## Módulo 6 — Blog + meta tags SEO (2026-04-11)

### Backend

- **`BlogModule`**
  - Público: `GET /api/blog`, `GET /api/blog/:slug`, `POST /api/blog/:slug/view` (incremento de `views`).
  - Admin (`JwtAuthGuard` + `AdminGuard`): `GET/PATCH/DELETE /api/admin/blog/posts`, `GET /api/admin/blog/posts/:id`, `POST /api/admin/blog/posts`, `POST /api/admin/blog/upload-image` (multipart `file` → bucket **`blog-images`** via service role).
- **`MetaTagsModule`**
  - Público: `GET /api/meta-tags?path=` — retorna objeto ou `null`.
  - Admin: `GET/POST/PATCH/DELETE /api/admin/meta-tags` (CRUD em `meta_tags`).

### Frontend

- **`src/lib/blog-api.ts`**, **`src/lib/admin-blog-api.ts`**, **`src/lib/meta-tags-api.ts`**.
- **`Blog.tsx`**, **`BlogPost.tsx`**, **`AdminBlogManager.tsx`**, **`BlogPostForm.tsx`**, **`RichTextEditor.tsx`**, **`useMetaTags.ts`**, **`AdminMetaTags.tsx`** — dados e uploads via API (imagens do editor e capa só com sessão admin + JWT).

**Pendente neste domínio:** sitemap (Edge ou rota Nest futura).

## Módulo 4 — Empresa + CRUD de vagas + admin jobs/companies (2026-04-11)

### Backend

- **`AdminGuard`** (`api/src/auth/guards/admin.guard.ts`) — após `JwtAuthGuard`, confere role `admin` em `user_roles` via `AuthService.isAdminUser`.
- **`CompaniesModule`**
  - `GET /api/companies/me`, `PATCH /api/companies/me` — JWT; exige papel `company` e linha em `companies.user_id`.
  - `GET/PATCH/DELETE /api/companies/me/jobs`, `GET /api/companies/me/jobs/:jobId`, `POST /api/companies/me/jobs`, `PATCH /api/companies/me/jobs/:jobId/status` — dono da empresa (`company.user_id`) ou admin nas mutações de vaga; regras espelhadas do dashboard (perfil verificado, freelancer só PJ/freelance).
- **`AdminModule`** — `GET /api/admin/dashboard` (listas recentes + contagens totais), `DELETE /api/admin/jobs/:id`, `DELETE /api/admin/companies/:id`, `PATCH /api/admin/companies/:id/verification`.
- **`JobsService`** — métodos de gestão (`listByCompany`, `createCompanyJob`, `updateCompanyJobForUser`, `deleteCompanyJobForUser`, `listForAdmin`, `deleteJobByAdmin`, etc.).

### Frontend

- **`src/lib/companies-dashboard-api.ts`**, **`src/lib/admin-api.ts`** — chamadas tipadas ao Nest.
- **`CompanyDashboard.tsx`** — dados, CRUD e **validação de CNPJ** via API (`POST /api/integrations/validate-cnpj`, BrasilAPI no servidor).
- **`Admin.tsx`** — listagem, exclusões, verificação de empresas, import de vagas e abas blog/meta via API (Módulos 6 e 7).

**Pendente neste domínio:** — (import e blog/meta migrados).

### Integrações (2026-04-11)

- **`IntegrationsModule`**: `POST /api/integrations/validate-cnpj` (JWT) — espelha a Edge `validate-cnpj` (dígitos verificadores + `https://brasilapi.com.br/api/cnpj/v1/{cnpj}`).
- **`src/lib/integrations-api.ts`** — cliente tipado; **`CompanyDashboard.tsx`** sem `supabase` neste fluxo.

## Módulo 3 — Vagas públicas + candidaturas (leitura) (2026-04-11)

### Backend

- **`JobsModule`**: `GET /api/jobs` (query: `search` → SQL `search_jobs`, filtros espelhando `Jobs.tsx`), `GET /api/jobs/:id`, `GET /api/jobs/featured/carousel`, `GET /api/jobs/recent/city`, `GET /api/jobs/candidate/applied-ids` (JWT).
- **`CandidatesModule`**: `GET /api/candidates/me` (JWT) — perfil do candidato.
- **`AuthModule`**: exporta `JwtStrategy` e `PassportModule` para uso do guard em outros módulos.
- Entidade **`Job`**: enum `ExperienceLevel` alinhado ao Postgres (`auxiliar`, `assistente`, `freelancer`, `jovem_aprendiz`).

### Frontend

- **`src/lib/jobs-api.ts`** — helpers e tipos para listagem e `applied-ids`.
- **`Jobs.tsx`**, **`JobDetails.tsx`**, **`JobsByCategory.tsx`**, **`ProgrammaticSeoPage.tsx`**, **`JobCarouselSection.tsx`**, **`RecentJobsByCity.tsx`** — passam a usar a API Nest.

**Escrita / admin (jobs e empresas):** migrado no Módulo 4.

## Módulo 2 — Admin / `has_role` (2026-04-11)

- **`AuthPayload`** passa a incluir `isAdmin` (consulta `user_roles.role = admin` via TypeORM, equivalente a `has_role` no Postgres).
- **`useAuth`**: estado e contexto expõem `isAdmin`; login, `/me` e signup atualizam o valor.
- **`useAdmin`**: removido `supabase.rpc('has_role')`; consome apenas `useAuth().isAdmin`.

## Módulo 1 — Autenticação (2026-04-11)

### Backend (`api/`)

- **Módulo** `AuthModule` com `AuthService`, `AuthController`, DTOs (`LoginDto`, `SignUpDto`), `JwtStrategy` (`passport-jwt`, algoritmo HS256) e `JwtAuthGuard`.
- **Endpoints**
  - `POST /api/auth/signup` — `auth.admin.createUser` com `email_confirm: true` (sem obrigatoriedade de confirmação por link) + `signInWithPassword` para retornar JWT e criar perfil na mesma resposta quando possível.
  - `POST /api/auth/login` — `signInWithPassword`; após sucesso executa criação de perfil (`candidate_profiles` / `companies`) conforme `user_metadata.role` e resolve `userRole` (equivalente ao antigo `ensureUserProfile` + `fetchUserRole` no React).
  - `POST /api/auth/logout` — protegido por JWT; resposta `{ ok: true }`. O cliente deve apagar tokens; o JWT permanece válido até expirar (padrão stateless).
  - `GET /api/auth/me` — protegido por JWT; valida token com `getUser`, sincroniza perfil e retorna `user`, `session` (stub com `access_token`; `refresh_token` pode ser mantido só no cliente) e `userRole`.
- **Variável de ambiente nova (obrigatória)**  
  `SUPABASE_JWT_SECRET` — segredo JWT do projeto (Supabase Dashboard → Settings → API → JWT Secret). Usado apenas no servidor para validar tokens emitidos pelo GoTrue.

### Frontend (`src/`)

- **`useAuth.tsx`** — removido `supabase.auth.*`; sessão via `GET /api/auth/me` na inicialização e login/signup/logout via API. Tipos exportados: `AuthUser`, `AuthSession`, `translateError`.
- **`services/api.ts`** — chaves `AUTH_ACCESS_TOKEN_KEY`, `AUTH_REFRESH_TOKEN_KEY`, `setStoredAuthTokens`, `clearStoredAuthTokens`.

### Referências internas

- Padrões JWT: `.agent/skills/api-patterns/auth.md` (assinatura, expiração, claims mínimos).
- OpenAPI: `http://localhost:3000/api/docs` (tag **Auth**).
