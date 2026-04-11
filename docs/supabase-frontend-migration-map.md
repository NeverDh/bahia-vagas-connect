# Mapa de migração Supabase → NestJS (Explorer)

Inventário **ponta a ponta** do uso atual do Supabase no frontend e das Edge Functions, alinhado ao `README.md` e ao objetivo do `to-do.md` (mapear dependências, riscos e destino no backend próprio).

**Escopo:** `src/` (React), `supabase/functions/`, funções SQL citadas no README.  
**Já migrado:** autenticação via `api` + `useAuth` (Módulo 1 — ver `docs/migration-log.md`).

---

## Legenda de risco

| Nível | Significado |
|--------|-------------|
| **Alto** | Anon key + RLS era a barreira; no Nest é obrigatório `JwtAuthGuard` + checagem de papel/dono + TypeORM/service_role com critério. |
| **Médio** | Leitura pública ou escrita com regras claras; ainda assim centralizar no Nest evita vazamento de padrões de query e chaves. |
| **Baixo** | Pode permanecer temporariamente no Supabase se houver proxy; ou já é infraestrutura (email hook). |

---

## 1. Cliente Supabase no browser

| Arquivo | Papel |
|---------|--------|
| `src/integrations/supabase/client.ts` | `createClient` com `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`. **Meta:** remover quando nenhum módulo importar este client. |

---

## 2. Tabelas e operações a partir do `src/`

Cada linha: onde está hoje, o quê faz, risco resumido, destino sugerido no Nest.

### 2.1 Vagas (`jobs`)

| Origem | Operações | Risco | Destino Nest (sugestão) |
|--------|-----------|-------|-------------------------|
| `pages/Jobs.tsx` | `rpc('search_jobs')`, `from('jobs')` select + count + filtros, `candidate_profiles` / `applications` para “já candidatou” | Médio (busca pública + dados do usuário logado) | `JobsModule`: `GET /api/jobs` (lista + filtros), `GET /api/jobs/search?q=` chamando SQL `search_jobs` ou query TypeORM; sub-rotas para estado de candidatura autenticado |
| `pages/JobDetails.tsx` | `from('jobs')`, perfil, `applications` | Idem | `GET /api/jobs/:id`, `GET /api/jobs/:id/application-status` (JWT) |
| `pages/JobsByCategory.tsx` | `from('jobs')` count/data, perfil + applications | Idem | Mesmo `JobsModule` com query params |
| `pages/ProgrammaticSeoPage.tsx` | Múltiplos `from('jobs')` count/data (SEO), perfil + applications | Médio | Idem; possível cache/CDN no futuro |
| `components/JobCarouselSection.tsx` | `from('jobs')` recentes / populares | Médio | `GET /api/jobs/featured` ou query na listagem |
| `components/RecentJobsByCity.tsx` | `from('jobs')` por cidade | Médio | `GET /api/jobs?location=` |
| `pages/CompanyDashboard.tsx` | `from('jobs')` listagem da empresa, insert/update/delete | **Alto** | `JobsModule` + policy: só `company_id` da empresa do usuário |
| `pages/Admin.tsx` | `from('jobs')` list + delete | **Alto** | `AdminModule` + guard admin |

### 2.2 Empresas (`companies`)

| Origem | Operações | Risco | Destino Nest |
|--------|-----------|-------|----------------|
| `pages/CompanyDashboard.tsx` | select/update empresa, CNPJ via function (ver §3) | **Alto** | `CompaniesModule` |
| `pages/Admin.tsx` | list, delete, `update is_verified` | **Alto** | `AdminModule` / `CompaniesModule` admin |

### 2.3 Candidatos (`candidate_profiles`)

| Origem | Operações | Risco | Destino Nest |
|--------|-----------|-------|----------------|
| `pages/Profile.tsx` | CRUD perfil, count applications, list applications | **Alto** | `CandidatesModule` |
| `pages/Jobs.tsx`, `JobDetails.tsx`, `JobsByCategory.tsx`, `ProgrammaticSeoPage.tsx` | leitura perfil + applications (fluxo candidatura) | Alto (mistura PII) | Endpoints dedicados sob JWT |

### 2.4 Candidaturas (`applications`)

| Origem | Operações | Risco | Destino Nest |
|--------|-----------|-------|----------------|
| `components/ApplicationForm.tsx` | `storage` resumes, update `candidate_profiles.resume_url`, insert `applications` | **Alto** | `ApplicationsModule` + `StorageModule` (signed URL) |
| Várias páginas de vagas | select para “já aplicou” | Médio/Alto | Agregado em `GET /api/jobs/...` |

**Nota:** `ApplicationForm.tsx` ainda usa `supabase.auth.getUser()` — deve passar a usar apenas `user` do `useAuth` (token já no `api`) para consistência com o Módulo 1.

### 2.5 Blog (`blog_posts`)

| Origem | Operações | Risco | Destino Nest |
|--------|-----------|-------|----------------|
| `pages/Blog.tsx` | list publicável | Médio | `BlogModule` |
| `pages/BlogPost.tsx` | get por slug, incremento `views` | Médio | `GET /api/blog/:slug` + `POST /api/blog/:slug/view` (rate limit) |
| `components/blog/AdminBlogManager.tsx` | list/delete (admin) | **Alto** | `BlogModule` admin |
| `components/blog/BlogPostForm.tsx` | CRUD + `storage` `blog-images` | **Alto** | `BlogModule` + upload via Nest/Storage |

### 2.6 SEO admin (`meta_tags`)

| Origem | Operações | Risco | Destino Nest |
|--------|-----------|-------|----------------|
| `components/AdminMetaTags.tsx` | CRUD | **Alto** | `SeoModule` ou `MetaTagsModule` |
| `hooks/useMetaTags.ts` | leitura por path (público) | Médio | `GET /api/meta-tags?path=` |

### 2.7 Analytics (`analytics_*`)

| Origem | Operações | Risco | Destino Nest |
|--------|-----------|-------|----------------|
| `pages/Analytics.tsx` | select em visitors, sessions, page_views | **Alto** | `AnalyticsModule` admin-only; dados sensíveis agregados |
| `hooks/useAnalyticsTracker.ts` | chama Edge `track-visit` (ver §3) | Médio | `POST /api/analytics/track` (replicar lógica da function ou proxy) |

### 2.8 RPC / roles

| Origem | Operações | Risco | Destino Nest |
|--------|-----------|-------|----------------|
| `hooks/useAdmin.ts` | ~~`rpc('has_role', { admin })`~~ | — | **Migrado:** `isAdmin` no payload de auth (`GET /api/auth/me`, login, signup) + `useAuth` / `useAdmin` |
| `pages/Jobs.tsx` | `rpc('search_jobs')` | Médio | Serviço que executa a mesma função SQL ou equivalente |

---

## 3. Edge Functions (Deno) — chamadas e papel

| Function | Chamada no `src/`? | JWT / secrets | Risco | Destino Nest (sugestão) |
|----------|-------------------|---------------|-------|-------------------------|
| `track-visit` | Sim — `useAnalyticsTracker.ts` | Não (público) | Médio | `POST /api/analytics/track` — portar lógica de `track-visit/index.ts` (hash IP, UA, CF headers) |
| `import-jobs` | Sim — `useImportJobs.ts` | Invocação com anon; function usa `SERVICE_ROLE` | **Alto** | `POST /api/jobs/import` protegido (admin/cron) + `RAPIDAPI_KEY` só no servidor |
| `validate-cnpj` | Sim — `CompanyDashboard.tsx` | Anon | Médio | `POST /api/integrations/validate-cnpj` |
| `sitemap` | Não diretamente no `src/` | Público | Baixo | `GET /api/seo/sitemap.xml` ou manter Edge até DNS/robots migrarem; `public/robots.txt` aponta para `sitemap.xml` no domínio principal |
| `auth-email-hook` | Não (invocada pelo Supabase Auth) | Hook configurado no projeto | Baixo | Manter no Supabase ou substituir por provedor de email no Nest mais adiante |

---

## 4. Storage (buckets)

| Bucket | Público | Uso no `src/` | Destino Nest |
|--------|---------|---------------|--------------|
| `resumes` | Não | `ApplicationForm.tsx` upload + URL | Signed upload URL gerada pelo backend; leitura só para dono/empresa da vaga |
| `blog-images` | Sim | `BlogPostForm.tsx`, `RichTextEditor.tsx` | Upload autenticado admin via Nest; URL pública mantida |
| `email-assets` | Sim | Templates em `supabase/functions/_shared` (não no React) | Permanece ou CDN estática |

---

## 5. Funções e triggers SQL (README)

| Nome | Uso no frontend | Notas |
|------|-----------------|-------|
| `has_role(uuid, app_role)` | `useAdmin.ts` | SECURITY DEFINER — substituir por query controlada no Nest |
| `search_jobs(text)` | `Jobs.tsx` | Full-text + unaccent — manter como função SQL chamada pelo Nest ou reimplementar |
| `handle_new_user_role()` | Indireto (insert perfil) | Backend já cria perfil no auth; trigger continua consistente se inserts passarem pelo Postgres |
| `update_updated_at_column()` | Automático | Sem mudança no app |
| `unaccent` | Via `search_jobs` | Permanece no Postgres |

---

## 6. Páginas sem client Supabase

Não importam `@/integrations/supabase/client` (dados estáticos ou reutilizam componentes):

- `pages/Companies.tsx`, `pages/JobsByCity.tsx` (delega a `Jobs`), `pages/Index.tsx`, várias legais/404, etc.

---

## 7. Backend Nest existente (`api/`)

| Área | Status |
|------|--------|
| Auth (signup, login, logout, me, JWT Supabase) | Implementado |
| Entities TypeORM | Alinhadas ao schema |
| Demais módulos (Jobs, Companies, …) | Pendentes |

---

## 8. Ordem sugerida de módulos (após este mapa)

1. **Roles / admin** — eliminar `has_role` no cliente (`useAdmin` → API).  
2. **Jobs + search** — maior superfície pública + `search_jobs`.  
3. **Companies + CompanyDashboard** — inclui `validate-cnpj`.  
4. **Candidates + Applications + Storage resumes** — PII e arquivos.  
5. **Blog + imagens** — CRUD admin + público.  
6. **Meta tags + useMetaTags** — SEO.  
7. **Analytics** — tracker + dashboard admin.  
8. **Import jobs** — operação privilegiada + secret externo.  
9. **Sitemap** — quando o domínio apontar para a API ou reverse proxy.

---

## 9. Riscos transversais (audit)

- **RLS:** Hoje a anon key não vê além das policies; no Nest, **toda rota mutável** deve validar JWT e autorização explícita (dono, empresa, admin).  
- **Service role:** Já usada no `api` — nunca expor ao browser.  
- **Edge Functions com SERVICE_ROLE:** `import-jobs`, `track-visit` — o padrão seguro é equivalente no Nest (apenas servidor).  
- **Dupla escrita:** Enquanto frontend e Nest escrevem no mesmo DB, manter regras idênticas (triggers `user_roles` etc.).

---

*Gerado como entrega da fase Explorer (Mapping + Audit). Atualizar este arquivo quando um módulo for migrado.*
