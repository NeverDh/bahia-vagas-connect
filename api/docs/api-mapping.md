# 🗺️ API Mapping — Frontend → Backend → Supabase

> Mapa completo de correspondência entre arquivos do frontend,
> endpoints do backend, e tabelas/funções do Supabase.

---

## Status da Migração

| Status | Significado |
|---|---|
| ✅ | Migrado e testado |
| 🔄 | Em progresso |
| ⬜ | Pendente |

---

## Auth

| Frontend File | Método Supabase Anterior | Endpoint Backend | Tabela/Função | Status |
|---|---|---|---|---|
| `useAuth.tsx` | `supabase.auth.signUp()` | `POST /api/auth/signup` | Supabase Auth | ⬜ |
| `useAuth.tsx` | `supabase.auth.signInWithPassword()` | `POST /api/auth/signin` | Supabase Auth | ⬜ |
| `useAuth.tsx` | `supabase.auth.signOut()` | `POST /api/auth/signout` | Supabase Auth | ⬜ |
| `useAuth.tsx` | `supabase.from("candidate_profiles")` | `POST /api/auth/signup` (internal) | candidate_profiles | ⬜ |
| `useAuth.tsx` | `supabase.from("companies")` | `POST /api/auth/signup` (internal) | companies | ⬜ |
| `useAuth.tsx` | `supabase.from("user_roles")` | `GET /api/auth/me` (internal) | user_roles | ⬜ |
| `useAdmin.ts` | `supabase.rpc("has_role")` | `GET /api/auth/me` (isAdmin field) | has_role() RPC | ⬜ |

## Jobs

| Frontend File | Método Supabase Anterior | Endpoint Backend | Tabela/Função | Status |
|---|---|---|---|---|
| `Jobs.tsx` | `supabase.rpc("search_jobs")` | `GET /api/jobs?q=...` | search_jobs() RPC | ⬜ |
| `Jobs.tsx` | `supabase.from("jobs").select()` | `GET /api/jobs` | jobs + companies | ⬜ |
| `JobDetails.tsx` | `supabase.from("jobs").select()` | `GET /api/jobs/:id` | jobs + companies | ⬜ |
| `useImportJobs.ts` | `supabase.functions.invoke("import-jobs")` | `POST /api/jobs/import` | jobs + companies | ⬜ |
| `CompanyDashboard.tsx` | `supabase.from("jobs").insert()` | `POST /api/jobs` | jobs | ⬜ |
| `CompanyDashboard.tsx` | `supabase.from("jobs").update()` | `PUT /api/jobs/:id` | jobs | ⬜ |
| `CompanyDashboard.tsx` | `supabase.from("jobs").delete()` | `DELETE /api/jobs/:id` | jobs | ⬜ |

## Companies

| Frontend File | Método Supabase Anterior | Endpoint Backend | Tabela/Função | Status |
|---|---|---|---|---|
| `Companies.tsx` | `supabase.from("companies").select()` | `GET /api/companies` | companies | ⬜ |
| `CompanyDashboard.tsx` | `supabase.from("companies").select()` | `GET /api/companies/:id` | companies | ⬜ |
| `CompanyDashboard.tsx` | `supabase.from("companies").update()` | `PUT /api/companies/:id` | companies | ⬜ |

## Candidates

| Frontend File | Método Supabase Anterior | Endpoint Backend | Tabela/Função | Status |
|---|---|---|---|---|
| `Profile.tsx` | `supabase.from("candidate_profiles").select()` | `GET /api/candidates/me` | candidate_profiles | ⬜ |
| `Profile.tsx` | `supabase.from("candidate_profiles").update()` | `PUT /api/candidates/me` | candidate_profiles | ⬜ |

## Applications

| Frontend File | Método Supabase Anterior | Endpoint Backend | Tabela/Função | Status |
|---|---|---|---|---|
| `ApplicationForm.tsx` | `supabase.from("applications").insert()` | `POST /api/applications` | applications | ⬜ |
| `Jobs.tsx` | `supabase.from("applications").select()` | `GET /api/applications` | applications | ⬜ |
| `CompanyDashboard.tsx` | `supabase.from("applications").select()` | `GET /api/applications` | applications | ⬜ |

## Blog

| Frontend File | Método Supabase Anterior | Endpoint Backend | Tabela/Função | Status |
|---|---|---|---|---|
| `Blog.tsx` | `supabase.from("blog_posts").select()` | `GET /api/blog` | blog_posts | ⬜ |
| `BlogPost.tsx` | `supabase.from("blog_posts").select()` | `GET /api/blog/:slug` | blog_posts | ⬜ |
| `AdminBlogManager.tsx` | `supabase.from("blog_posts").insert/update/delete()` | `POST/PUT/DELETE /api/blog` | blog_posts | ⬜ |

## Analytics

| Frontend File | Método Supabase Anterior | Endpoint Backend | Tabela/Função | Status |
|---|---|---|---|---|
| `useAnalyticsTracker.ts` | ~~`supabase.functions.invoke("track-visit")`~~ | `POST /api/analytics/track` | analytics_* | ✅ |
| `Analytics.tsx` | ~~`supabase.from("analytics_*").select()`~~ | `GET /api/admin/analytics?since=` | analytics_* | ✅ |
| `useImportJobs.ts` | ~~Edge `import-jobs`~~ | `POST /api/admin/jobs/import` | jobs + companies | ✅ |

## SEO

| Frontend File | Método Supabase Anterior | Endpoint Backend | Tabela/Função | Status |
|---|---|---|---|---|
| `useMetaTags.ts` | `supabase.from("meta_tags").select()` | `GET /api/seo/meta-tags?path=...` | meta_tags | ⬜ |
| `AdminMetaTags.tsx` | `supabase.from("meta_tags").insert/update/delete()` | `POST/PUT/DELETE /api/seo/meta-tags` | meta_tags | ⬜ |

## Storage

| Frontend File | Método Supabase Anterior | Endpoint Backend | Tabela/Função | Status |
|---|---|---|---|---|
| `Profile.tsx` | `supabase.storage.from("resumes").upload()` | `POST /api/storage/resume` | Storage bucket | ⬜ |

## Integrations

| Frontend File | Método Supabase Anterior | Endpoint Backend | Tabela/Função | Status |
|---|---|---|---|---|
| `CompanyDashboard.tsx` | `supabase.functions.invoke("validate-cnpj")` | `POST /api/cnpj/validate` | BrasilAPI | ⬜ |
