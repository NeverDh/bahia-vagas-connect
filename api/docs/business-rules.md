# 📋 Regras de Negócio — BahiaVagas

> Todas as regras de negócio implícitas descobertas na análise do código,
> agora documentadas explicitamente. Cada regra é referenciada nos JSDoc
> dos services que a implementam.

---

## Autenticação & Perfis

### Regra #1 — Criação de perfil dual-path
**Onde**: `auth.service.ts` (backend) — antes em `useAuth.tsx` (frontend)  
**Descrição**: O perfil do usuário pode ser criado tanto por um trigger do banco (`handle_new_user_role`) quanto pelo backend via `ensureUserProfile()`. O backend faz um check (`maybeSingle`) antes de inserir para evitar duplicata.

### Regra #2 — Admin tem role funcional
**Onde**: `auth.service.ts` (backend) — antes em `useAuth.tsx:L129-L134`  
**Descrição**: Se o usuário é admin E tem outra role (candidate/company), o `userRole` retornado é a role funcional (não "admin"). A verificação de admin é feita separadamente via `has_role()`.

### Regra #3 — Fallback de role por perfil
**Onde**: `auth.service.ts` (backend) — antes em `useAuth.tsx:L138-L161`  
**Descrição**: Se não encontra role na tabela `user_roles`, verifica se existe perfil em `candidate_profiles` ou `companies` como fallback para determinar a role.

### Regra #4 — Checagem única de perfil por sessão
**Onde**: `auth.service.ts` (backend) — antes em `useAuth.tsx:L64`  
**Descrição**: O sistema usa um mecanismo de cache para evitar checagens repetidas do perfil para o mesmo user_id na mesma sessão.

---

## Vagas & Busca

### Regra #5 — Full-text search com unaccent
**Onde**: `jobs.service.ts` (backend) — antes em `Jobs.tsx:L83-L84`  
**Descrição**: A busca de vagas usa a função PostgreSQL `search_jobs()` que faz full-text search removendo acentos. Busca em: título, descrição, categoria e nome da empresa.

### Regra #6 — Filtro por experience combina DB + título
**Onde**: `jobs.service.ts` (backend) — antes em `Jobs.tsx:L117-L137`  
**Descrição**: Além de filtrar por `experience_level` no banco, faz busca por keywords no título:
- `auxiliar` → nível "auxiliar"
- `assistente` → nível "assistente"
- `estágio/estagiário` → nível "intern"

### Regra #7 — Redirecionamento por município
**Onde**: Permanece no frontend `Jobs.tsx` (decisão de UI/routing)  
**Descrição**: Quando o filtro de location muda para um município da Bahia, o frontend redireciona para `/vagas-{slug}`. Esta regra continua no frontend pois é de routing.

### Regra #8 — Importação com cidade aleatória
**Onde**: `jobs/import/import.service.ts` (backend) — antes em Edge Function `import-jobs:L107`  
**Descrição**: Cada execução da importação de vagas busca em uma cidade aleatória de uma lista de 50 cidades da Bahia, para distribuir a cobertura ao longo do tempo.

### Regra #9 — Deduplicação dupla na importação
**Onde**: `jobs/import/import.service.ts` (backend) — antes em Edge Function `import-jobs:L228-L262`  
**Descrição**: Vagas importadas são verificadas por duplicata em DOIS critérios:
1. `external_url` (se a URL de candidatura já existe)
2. `title + location` (se título e local já existem)

### Regra #10 — Empresa padrão para importação
**Onde**: `jobs/import/import.service.ts` (backend) — antes em Edge Function `import-jobs:L174-L197`  
**Descrição**: Vagas importadas via API externa são associadas a uma empresa fixa chamada "Vagas Importadas" (criada automaticamente sem `user_id`).

---

## SEO & Analytics

### Regra #11 — SEO programático = 180+ páginas
**Onde**: Permanece no frontend `seo-programmatic.ts`  
**Descrição**: O sistema combina 10 profissões × 10 cidades × 8 tipos para gerar páginas SEO automaticamente. Total: 180+ páginas combinatórias.

### Regra #12 — Detecção de Lovable.app
**Onde**: Permanece no frontend `index.html`  
**Descrição**: Script no HTML detecta acesso via `lovable.app`, injeta `noindex,nofollow` e redireciona para `bahiavagas.com`.

### Regra #13 — Sessão de analytics via ref
**Onde**: `analytics.service.ts` (backend) — antes em `useAnalyticsTracker.ts`  
**Descrição**: O session_id é retornado pela API e mantido pelo frontend entre navegações. Se o browser fecha, uma nova sessão é criada.

### Regra #14 — Meta tags dinâmicas por DB lookup
**Onde**: `seo.service.ts` (backend) — antes em `useMetaTags.ts`  
**Descrição**: Cada navegação consulta a tabela `meta_tags` por `page_path`. Se existe registro, sobrescreve título e meta tags do HTML.

### Regra #15 — Canonical sempre bahiavagas.com
**Onde**: Permanece no frontend `useMetaTags.ts:L44`  
**Descrição**: Todas as URLs canônicas apontam para `https://bahiavagas.com{pathname}`, inclusive em desenvolvimento.

---

## Notas

- Regras que permanecem no frontend são de **routing/UI** e não de business logic
- Regras migradas para o backend são referenciadas nos JSDoc dos services correspondentes
- Esta lista deve ser atualizada sempre que uma nova regra for descoberta ou modificada
