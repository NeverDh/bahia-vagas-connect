# Migration log — BahiaVagas (React → NestJS proxy)

Registro das fases de migração do frontend para a API NestJS. Complementa referências em `src/services/api.ts` e `.agent/ARCHITECTURE.md`.

## Inventário Explorer (2026-04-11)

- **`docs/supabase-frontend-migration-map.md`** — Mapeamento ponta a ponta: tabelas e arquivos no `src/`, Edge Functions, storage, RPC SQL, riscos e ordem sugerida de módulos Nest.

## Módulo 2 — Admin / `has_role` (2026-04-11)

- **`AuthPayload`** passa a incluir `isAdmin` (consulta `user_roles.role = admin` via TypeORM, equivalente a `has_role` no Postgres).
- **`useAuth`**: estado e contexto expõem `isAdmin`; login, `/me` e signup atualizam o valor.
- **`useAdmin`**: removido `supabase.rpc('has_role')`; consome apenas `useAuth().isAdmin`.

## Módulo 1 — Autenticação (2026-04-11)

### Backend (`api/`)

- **Módulo** `AuthModule` com `AuthService`, `AuthController`, DTOs (`LoginDto`, `SignUpDto`), `JwtStrategy` (`passport-jwt`, algoritmo HS256) e `JwtAuthGuard`.
- **Endpoints**
  - `POST /api/auth/signup` — `auth.admin.createUser` com `email_confirm: false` (fluxo de confirmação de email do Supabase quando habilitado no projeto). Não retorna sessão até o usuário confirmar e fazer login.
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
