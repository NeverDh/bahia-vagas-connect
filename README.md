# 🟦 BahiaVagas — O Melhor Site de Empregos na Bahia

> Portal de empregos focado exclusivamente no estado da Bahia, Brasil.  
> Domínio oficial: **https://bahiavagas.com**

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias e Stack](#tecnologias-e-stack)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Design System](#design-system)
- [Banco de Dados](#banco-de-dados)
- [Funções do Banco de Dados](#funções-do-banco-de-dados)
- [Edge Functions (APIs)](#edge-functions-apis)
- [Rotas da Aplicação](#rotas-da-aplicação)
- [SEO e Indexação](#seo-e-indexação)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Analytics Interno](#analytics-interno)
- [Integrações Externas](#integrações-externas)
- [Como Executar](#como-executar)

---

## Visão Geral

O **BahiaVagas** é uma plataforma SPA (Single Page Application) que conecta candidatos a vagas de emprego no estado da Bahia. Conta com:

- Listagem e busca de vagas com filtros avançados
- Cadastro de candidatos e empresas
- Painel administrativo com analytics em tempo real
- Blog com editor rich text
- SEO programático com 180+ páginas geradas automaticamente
- Sistema de importação automática de vagas via API externa (JSearch/RapidAPI)
- Sitemap dinâmico com todas as URLs

---

## Tecnologias e Stack

### Frontend

| Tecnologia | Versão | Descrição |
|---|---|---|
| **React** | ^18.3.1 | Biblioteca UI principal |
| **React DOM** | ^18.3.1 | Renderização DOM |
| **TypeScript** | ^5.8.3 | Tipagem estática |
| **Vite** | ^5.4.19 | Bundler e dev server |
| **@vitejs/plugin-react-swc** | ^3.11.0 | Plugin React com SWC (compilação rápida) |
| **Tailwind CSS** | ^3.4.17 | Framework de estilos utilitários |
| **tailwindcss-animate** | ^1.0.7 | Animações via Tailwind |
| **@tailwindcss/typography** | ^0.5.16 | Plugin de tipografia para prose |
| **PostCSS** | ^8.5.6 | Processador CSS |
| **Autoprefixer** | ^10.4.21 | Prefixos automáticos CSS |

### Componentes UI (shadcn/ui + Radix)

| Pacote | Versão |
|---|---|
| `@radix-ui/react-accordion` | ^1.2.11 |
| `@radix-ui/react-alert-dialog` | ^1.1.14 |
| `@radix-ui/react-aspect-ratio` | ^1.1.7 |
| `@radix-ui/react-avatar` | ^1.1.10 |
| `@radix-ui/react-checkbox` | ^1.3.2 |
| `@radix-ui/react-collapsible` | ^1.1.11 |
| `@radix-ui/react-context-menu` | ^2.2.15 |
| `@radix-ui/react-dialog` | ^1.1.14 |
| `@radix-ui/react-dropdown-menu` | ^2.1.15 |
| `@radix-ui/react-hover-card` | ^1.1.14 |
| `@radix-ui/react-label` | ^2.1.7 |
| `@radix-ui/react-menubar` | ^1.1.15 |
| `@radix-ui/react-navigation-menu` | ^1.2.13 |
| `@radix-ui/react-popover` | ^1.1.14 |
| `@radix-ui/react-progress` | ^1.1.7 |
| `@radix-ui/react-radio-group` | ^1.3.7 |
| `@radix-ui/react-scroll-area` | ^1.2.9 |
| `@radix-ui/react-select` | ^2.2.5 |
| `@radix-ui/react-separator` | ^1.1.7 |
| `@radix-ui/react-slider` | ^1.3.5 |
| `@radix-ui/react-slot` | ^1.2.3 |
| `@radix-ui/react-switch` | ^1.2.5 |
| `@radix-ui/react-tabs` | ^1.1.12 |
| `@radix-ui/react-toast` | ^1.2.14 |
| `@radix-ui/react-toggle` | ^1.1.9 |
| `@radix-ui/react-toggle-group` | ^1.1.10 |
| `@radix-ui/react-tooltip` | ^1.2.7 |
| `class-variance-authority` | ^0.7.1 |
| `clsx` | ^2.1.1 |
| `tailwind-merge` | ^2.6.0 |
| `cmdk` | ^1.1.1 |
| `vaul` | ^0.9.9 |
| `sonner` | ^1.7.4 |
| `input-otp` | ^1.4.2 |
| `react-resizable-panels` | ^2.1.9 |

### Editor Rich Text (Blog)

| Pacote | Versão |
|---|---|
| `@tiptap/react` | ^3.20.0 |
| `@tiptap/starter-kit` | ^3.20.0 |
| `@tiptap/extension-blockquote` | ^3.20.0 |
| `@tiptap/extension-code-block` | ^3.20.0 |
| `@tiptap/extension-color` | ^3.20.0 |
| `@tiptap/extension-font-size` | ^3.0.0-next.3 |
| `@tiptap/extension-heading` | ^3.20.0 |
| `@tiptap/extension-image` | ^3.20.0 |
| `@tiptap/extension-link` | ^3.20.0 |
| `@tiptap/extension-placeholder` | ^3.20.0 |
| `@tiptap/extension-table` | ^3.20.0 |
| `@tiptap/extension-table-cell` | ^3.20.0 |
| `@tiptap/extension-table-header` | ^3.20.0 |
| `@tiptap/extension-table-row` | ^3.20.0 |
| `@tiptap/extension-text-align` | ^3.20.0 |
| `@tiptap/extension-text-style` | ^3.20.0 |
| `@tiptap/extension-underline` | ^3.20.0 |
| `@tiptap/extension-youtube` | ^3.20.0 |

### Gerenciamento de Estado e Dados

| Pacote | Versão | Descrição |
|---|---|---|
| `@tanstack/react-query` | ^5.83.0 | Cache e fetching de dados |
| `react-hook-form` | ^7.61.1 | Formulários performáticos |
| `@hookform/resolvers` | ^3.10.0 | Resolvers de validação |
| `zod` | ^3.25.76 | Validação de schemas |
| `next-themes` | ^0.3.0 | Tema claro/escuro |

### Roteamento e Navegação

| Pacote | Versão |
|---|---|
| `react-router-dom` | ^6.30.1 |

### Gráficos e Visualização

| Pacote | Versão |
|---|---|
| `recharts` | ^2.15.4 |

### Carrossel

| Pacote | Versão |
|---|---|
| `embla-carousel-react` | ^8.6.0 |
| `embla-carousel-autoplay` | ^8.6.0 |

### Utilitários

| Pacote | Versão |
|---|---|
| `date-fns` | ^4.1.0 |
| `lucide-react` | ^0.462.0 |
| `react-day-picker` | ^8.10.1 |

### Backend (Supabase)

| Tecnologia | Versão | Descrição |
|---|---|---|
| `@supabase/supabase-js` | ^2.x (`api/`) | SDK do Supabase só no servidor (Auth/Storage); SPA sem dependência direta |
| **PostgreSQL** | — | Banco de dados relacional |
| **Deno** | — | Runtime para Edge Functions |
| **Row Level Security (RLS)** | — | Segurança a nível de linha |

### Linting e Qualidade

| Pacote | Versão |
|---|---|
| `eslint` | ^9.32.0 |
| `@eslint/js` | ^9.32.0 |
| `eslint-plugin-react-hooks` | ^5.2.0 |
| `eslint-plugin-react-refresh` | ^0.4.20 |
| `typescript-eslint` | ^8.38.0 |
| `globals` | ^15.15.0 |

---

## Estrutura de Pastas

```
bahiavagas/
├── index.html                          # HTML principal com meta tags, OG, GTM
├── package.json                        # Dependências e scripts
├── vite.config.ts                      # Configuração do Vite
├── tailwind.config.ts                  # Configuração do Tailwind CSS
├── tsconfig.json                       # Configuração base do TypeScript
├── tsconfig.app.json                   # TypeScript para a aplicação
├── tsconfig.node.json                  # TypeScript para Node/Vite
├── postcss.config.js                   # Configuração PostCSS
├── eslint.config.js                    # Configuração ESLint
├── components.json                     # Configuração do shadcn/ui
├── public/
│   ├── ads.txt                         # Configuração de anúncios
│   ├── manifest.json                   # PWA manifest
│   ├── placeholder.svg                 # Imagem placeholder
│   └── robots.txt                      # Diretivas para crawlers
├── src/
│   ├── main.tsx                        # Ponto de entrada da aplicação
│   ├── App.tsx                         # Componente raiz com rotas
│   ├── App.css                         # Estilos globais adicionais
│   ├── index.css                       # Design system (variáveis CSS/HSL)
│   ├── vite-env.d.ts                   # Tipos do Vite
│   ├── components/
│   │   ├── AdBanner.tsx                # Banner de anúncios
│   │   ├── AdminMetaTags.tsx           # Gerenciador de meta tags (admin)
│   │   ├── ApplicationForm.tsx         # Formulário de candidatura
│   │   ├── CookieConsent.tsx           # Banner de consentimento de cookies
│   │   ├── CookieGuard.tsx             # Guard de cookies para analytics
│   │   ├── Footer.tsx                  # Rodapé do site
│   │   ├── Header.tsx                  # Cabeçalho/navegação
│   │   ├── ImportJobsButton.tsx        # Botão de importação de vagas
│   │   ├── JobCard.tsx                 # Card de vaga individual
│   │   ├── JobCarouselSection.tsx      # Carrossel de vagas
│   │   ├── JobFilters.tsx              # Filtros de busca de vagas
│   │   ├── MainLayout.tsx              # Layout principal (header + footer)
│   │   ├── NavLink.tsx                 # Link de navegação
│   │   ├── Pagination.tsx              # Componente de paginação
│   │   ├── RecentJobsByCity.tsx         # Vagas recentes por cidade
│   │   ├── ThemeToggle.tsx             # Alternador de tema claro/escuro
│   │   ├── blog/
│   │   │   ├── AdminBlogManager.tsx    # Gerenciador de posts (admin)
│   │   │   ├── BlogPostForm.tsx        # Formulário de criação/edição
│   │   │   └── RichTextEditor.tsx      # Editor TipTap
│   │   └── ui/                         # ~50 componentes shadcn/ui
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       └── ... (demais componentes)
│   ├── hooks/
│   │   ├── useAdmin.ts                 # Verificação de role admin
│   │   ├── useAnalyticsTracker.ts      # Rastreamento de visitas
│   │   ├── useAuth.tsx                 # Contexto de autenticação
│   │   ├── useImportJobs.ts            # Hook de importação de vagas
│   │   ├── useMetaTags.ts              # Meta tags dinâmicas
│   │   ├── useViewedJobs.ts            # Vagas visualizadas recentemente
│   │   ├── use-mobile.tsx              # Detecção de dispositivo mobile
│   │   └── use-toast.ts               # Sistema de notificações toast
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts               # Cliente Supabase (auto-gerado)
│   │       └── types.ts                # Tipos do banco (auto-gerado)
│   ├── lib/
│   │   ├── bahia-municipios.ts         # Lista de 417 municípios da Bahia
│   │   ├── image-optimizer.ts          # Otimização de imagens
│   │   ├── seo-job-pages.ts            # Páginas SEO por categoria de vaga
│   │   ├── seo-programmatic.ts         # SEO programático (180+ páginas)
│   │   └── utils.ts                    # Utilitários (cn, etc.)
│   └── pages/
│       ├── Index.tsx                    # Página inicial
│       ├── Jobs.tsx                     # Listagem de vagas
│       ├── JobDetails.tsx              # Detalhes da vaga
│       ├── JobsByCity.tsx              # Vagas por cidade
│       ├── JobsByCategory.tsx          # Vagas por categoria SEO
│       ├── ProgrammaticSeoPage.tsx     # Páginas programáticas SEO
│       ├── Auth.tsx                    # Login e cadastro
│       ├── Profile.tsx                 # Perfil do candidato
│       ├── Companies.tsx               # Listagem de empresas
│       ├── CompanyDashboard.tsx        # Dashboard da empresa
│       ├── Admin.tsx                   # Painel administrativo
│       ├── Analytics.tsx               # Dashboard de analytics (admin)
│       ├── Blog.tsx                    # Listagem do blog
│       ├── BlogPost.tsx                # Post individual do blog
│       ├── SiteUrls.tsx                # Lista de URLs do site
│       ├── PrivacyPolicy.tsx           # Política de privacidade
│       ├── CookiesNecessarios.tsx      # Página de cookies
│       ├── TermosDeUso.tsx             # Termos de uso
│       └── NotFound.tsx                # Página 404
├── supabase/
│   ├── config.toml                     # Configuração do projeto Supabase
│   ├── migrations/                     # Migrações SQL (auto-gerenciadas)
│   └── functions/
│       ├── _shared/
│       │   └── email-templates/        # Templates de e-mail React
│       │       ├── signup.tsx
│       │       ├── invite.tsx
│       │       ├── magic-link.tsx
│       │       ├── recovery.tsx
│       │       ├── email-change.tsx
│       │       └── reauthentication.tsx
│       ├── auth-email-hook/            # Hook de e-mails de autenticação
│       │   ├── index.ts
│       │   └── deno.json
│       ├── import-jobs/                # Importação de vagas via JSearch API
│       │   └── index.ts
│       ├── sitemap/                    # Gerador de sitemap dinâmico
│       │   └── index.ts
│       ├── track-visit/                # Rastreamento de visitas (analytics)
│       │   └── index.ts
│       └── validate-cnpj/              # Validação de CNPJ
│           └── index.ts
```

---

## Design System

O design system é definido em `src/index.css` usando variáveis CSS em **HSL**, consumidas pelo Tailwind CSS via tokens semânticos.

### Cores (Modo Claro)

| Token | Valor HSL | Uso |
|---|---|---|
| `--background` | `0 0% 100%` | Fundo principal |
| `--foreground` | `220 15% 20%` | Texto principal |
| `--primary` | `215 85% 35%` | Cor primária (azul) |
| `--primary-foreground` | `0 0% 100%` | Texto sobre primária |
| `--secondary` | `210 40% 96%` | Cor secundária |
| `--accent` | `18 95% 60%` | Cor de destaque (laranja) |
| `--muted` | `210 40% 96%` | Elementos silenciados |
| `--destructive` | `0 84% 60%` | Ações destrutivas (vermelho) |
| `--border` | `214 31% 91%` | Bordas |
| `--ring` | `215 85% 35%` | Anéis de foco |

### Cores (Modo Escuro)

| Token | Valor HSL |
|---|---|
| `--background` | `220 20% 10%` |
| `--foreground` | `210 40% 98%` |
| `--primary` | `215 85% 45%` |
| `--card` | `220 18% 15%` |
| `--muted` | `220 15% 20%` |
| `--accent` | `18 95% 55%` |

### Variáveis Especiais

```css
--radius: 0.75rem;
--gradient-primary: linear-gradient(135deg, hsl(215 85% 35%), hsl(215 90% 45%));
--gradient-accent: linear-gradient(135deg, hsl(18 95% 60%), hsl(28 95% 65%));
--shadow-card: 0 2px 8px -2px hsl(215 85% 35% / 0.08);
--shadow-hover: 0 8px 24px -4px hsl(215 85% 35% / 0.15);
```

### Tipografia e Componentes

- **Componentes UI**: shadcn/ui baseado em Radix UI (~50 componentes)
- **Ícones**: Lucide React (^0.462.0)
- **Tema**: Suporte a claro/escuro via `next-themes`
- **Animações**: `tailwindcss-animate`

---

## Banco de Dados

### Diagrama de Tabelas

```
┌─────────────────────┐     ┌─────────────────────┐
│   analytics_visitors │     │   analytics_sessions │
│─────────────────────│     │─────────────────────│
│ id (uuid, PK)       │◄────│ visitor_id (uuid, FK)│
│ ip_hash (text)      │     │ id (uuid, PK)       │
│ first_visit (tstz)  │     │ device (text)       │
│ last_visit (tstz)   │     │ browser (text)      │
│ is_returning (bool) │     │ os (text)           │
│ visit_count (int)   │     │ country (text)      │
│ is_admin (bool)     │     │ city (text)         │
└─────────────────────┘     │ region (text)       │
                            │ referrer (text)     │
                            │ is_admin (bool)     │
                            │ started_at (tstz)   │
                            │ ended_at (tstz)     │
                            └────────┬────────────┘
                                     │
                            ┌────────▼────────────┐
                            │ analytics_page_views │
                            │─────────────────────│
                            │ id (uuid, PK)       │
                            │ session_id (uuid,FK)│
                            │ page_url (text)     │
                            │ page_title (text)   │
                            │ duration_seconds    │
                            │ viewed_at (tstz)    │
                            └─────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐
│ candidate_profiles  │     │     applications     │
│─────────────────────│     │─────────────────────│
│ id (uuid, PK)       │◄────│ candidate_id (uuid) │
│ user_id (uuid)      │     │ id (uuid, PK)       │
│ full_name (text)    │     │ job_id (uuid, FK)───│──┐
│ phone (text)        │     │ status (text)       │  │
│ bio (text)          │     │ cover_letter (text) │  │
│ skills (text[])     │     │ created_at (tstz)   │  │
│ linkedin_url (text) │     └─────────────────────┘  │
│ resume_url (text)   │                               │
└─────────────────────┘     ┌─────────────────────┐  │
                            │        jobs          │  │
┌─────────────────────┐     │─────────────────────│  │
│      companies      │     │ id (uuid, PK)       │◄─┘
│─────────────────────│     │ company_id (uuid,FK)│
│ id (uuid, PK)       │◄────│ title (text)        │
│ user_id (uuid)      │     │ description (text)  │
│ name (text)         │     │ category (text)     │
│ cnpj (text)         │     │ location (text)     │
│ is_freelancer (bool)│     │ contract_type (enum)│
│ is_verified (bool)  │     │ experience_level    │
│ location (text)     │     │ salary_min (numeric)│
│ logo_url (text)     │     │ salary_max (numeric)│
│ phone (text)        │     │ remote_option (bool)│
│ website (text)      │     │ status (enum)       │
│ description (text)  │     │ external_url (text) │
└─────────────────────┘     │ expires_at (tstz)   │
                            └─────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐
│     user_roles      │     │      meta_tags      │
│─────────────────────│     │─────────────────────│
│ id (uuid, PK)       │     │ id (uuid, PK)       │
│ user_id (uuid)      │     │ page_path (text)    │
│ role (app_role enum)│     │ title (text)        │
│ created_at (tstz)   │     │ description (text)  │
└─────────────────────┘     │ keywords (text)     │
                            │ og_title (text)     │
┌─────────────────────┐     │ og_description      │
│     blog_posts      │     │ og_image (text)     │
│─────────────────────│     └─────────────────────┘
│ id (uuid, PK)       │
│ title (text)        │
│ slug (text, unique) │
│ content (text)      │
│ excerpt (text)      │
│ featured_image      │
│ author (text)       │
│ category (text)     │
│ tags (text[])       │
│ meta_title (text)   │
│ meta_description    │
│ og_title (text)     │
│ og_description      │
│ og_image (text)     │
│ canonical_url (text)│
│ status (text)       │
│ published_at (tstz) │
│ views (int)         │
└─────────────────────┘
```

### Enums

| Enum | Valores |
|---|---|
| `app_role` | `candidate`, `company`, `admin` |
| `contract_type` | `clt`, `pj`, `temporary`, `intern`, `freelance` |
| `experience_level` | `intern`, `junior`, `mid`, `senior`, `specialist`, `auxiliar`, `assistente`, `freelancer`, `jovem_aprendiz` |
| `job_status` | `active`, `closed`, `draft` |

### Storage Buckets

| Bucket | Público | Uso |
|---|---|---|
| `resumes` | ❌ | Currículos dos candidatos |
| `blog-images` | ✅ | Imagens do blog |
| `email-assets` | ✅ | Assets dos templates de e-mail |

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado. Resumo das políticas:

- **Vagas (`jobs`)**: Leitura pública para vagas ativas; CRUD completo para empresas donas e admins
- **Empresas (`companies`)**: Leitura pública; edição apenas pelo dono ou admin
- **Candidatos (`candidate_profiles`)**: Leitura por empresas autenticadas; edição pelo próprio candidato
- **Candidaturas (`applications`)**: Visíveis ao candidato dono e à empresa da vaga
- **Blog (`blog_posts`)**: Posts publicados são públicos; CRUD restrito a admins
- **Meta Tags (`meta_tags`)**: Leitura pública; CRUD restrito a admins
- **User Roles (`user_roles`)**: Leitura pelo próprio usuário; CRUD restrito a admins
- **Analytics**: Inserção pública (tracking); leitura/deleção restrita a admins

---

## Funções do Banco de Dados

### `has_role(_user_id uuid, _role app_role) → boolean`
Verifica se um usuário possui uma role específica. **SECURITY DEFINER** — evita recursão em políticas RLS.

```sql
SELECT public.has_role(auth.uid(), 'admin');
```

### `search_jobs(search_text text) → SETOF uuid`
Busca full-text de vagas ativas com suporte a **unaccent** (busca sem acentos). Pesquisa em título, descrição, categoria e nome da empresa.

```sql
SELECT * FROM search_jobs('vendedor salvador');
```

### `handle_new_user_role() → trigger`
Trigger que automaticamente insere a role correspondente na tabela `user_roles` quando um novo perfil de candidato ou empresa é criado.

### `update_updated_at_column() → trigger`
Atualiza automaticamente o campo `updated_at` em operações de UPDATE.

### `unaccent(text) → text`
Extensão PostgreSQL para remoção de acentos em buscas.

---

## Edge Functions (APIs)

Todas as Edge Functions rodam em **Deno** e são deployadas automaticamente.

### 1. `track-visit`
**Endpoint**: `POST /functions/v1/track-visit`  
**JWT**: Não requerido  
**Descrição**: Rastreia visitas ao site para o sistema de analytics interno.

**Payload**:
```json
{
  "page_url": "/vagas",
  "page_title": "Vagas de Emprego",
  "session_id": "uuid-opcional",
  "referrer": "https://google.com",
  "is_admin": false
}
```

**Lógica**:
- Hash SHA-256 do IP com salt para privacidade
- Detecção de dispositivo, browser e OS via User-Agent
- Geolocalização via headers Cloudflare (`cf-ipcountry`, `cf-ipcity`)
- Upsert de visitante (novo vs recorrente)
- Criação/reutilização de sessão
- Registro de page view

### 2. `import-jobs`
**Endpoint**: `POST /functions/v1/import-jobs`  
**JWT**: Não requerido  
**Descrição**: Importa vagas de emprego da **JSearch API** (RapidAPI) para o banco de dados.

**Funcionalidades**:
- Busca vagas na Bahia via API externa
- Mapeia tipos de contrato e níveis de experiência
- Cria empresas automaticamente se não existirem
- Evita duplicatas por `external_url`
- Requer secret `RAPIDAPI_KEY`

### 3. `sitemap`
**Endpoint**: `GET /functions/v1/sitemap`  
**JWT**: Não requerido  
**Descrição**: Gera sitemap XML dinâmico com todas as URLs do site.

**Inclui**:
- Páginas estáticas (home, vagas, blog, etc.)
- 417 páginas de municípios da Bahia
- 180+ páginas SEO programáticas
- Vagas ativas do banco de dados
- Posts publicados do blog

### 4. `validate-cnpj`
**Endpoint**: `POST /functions/v1/validate-cnpj`  
**JWT**: Não requerido  
**Descrição**: Valida CNPJ com verificação de dígitos e consulta opcional a API externa.

### 5. `auth-email-hook` (legado / desativado na operação atual)
**Endpoint**: `POST /functions/v1/auth-email-hook`  
**JWT**: Não requerido  

**Estado**: o envio transacional de Auth deve usar **e-mail nativo do Supabase** (templates no Dashboard e, se necessário, **SMTP personalizado** no projeto). Desative o **Send Email Hook** que apontava para esta função. Instruções: **`docs/supabase-auth-email.md`**.

O código e os templates React em `_shared/email-templates/` permanecem no repo só como referência.

---

## Rotas da Aplicação

### Rotas Públicas

| Rota | Página | Descrição |
|---|---|---|
| `/` | `Index` | Página inicial |
| `/vagas` | `Jobs` | Listagem de vagas com filtros |
| `/vaga/:id` | `JobDetails` | Detalhes de uma vaga |
| `/empresas` | `Companies` | Listagem de empresas |
| `/auth` | `Auth` | Login e cadastro |
| `/blog` | `Blog` | Listagem de posts |
| `/blog/:slug` | `BlogPost` | Post individual |
| `/privacidade` | `PrivacyPolicy` | Política de privacidade |
| `/cookies-necessarios` | `CookiesNecessarios` | Informações sobre cookies |
| `/termos-de-uso` | `TermosDeUso` | Termos de uso |
| `/urls` | `SiteUrls` | Mapa de URLs do site |

### Rotas Autenticadas

| Rota | Página | Descrição |
|---|---|---|
| `/perfil` | `Profile` | Perfil do candidato |
| `/empresa/dashboard` | `CompanyDashboard` | Dashboard da empresa |

### Rotas Administrativas (admin only)

| Rota | Página | Descrição |
|---|---|---|
| `/admin` | `Admin` | Painel administrativo |
| `/admin/analytics` | `Analytics` | Dashboard de analytics |

### Rotas SEO Dinâmicas

| Padrão | Quantidade | Descrição |
|---|---|---|
| `/vagas-{categoria}` | ~10 | Páginas por categoria de vaga (vendedor, atendente, etc.) |
| `/vagas-{profissão}-{cidade}` | 180+ | Páginas programáticas SEO |
| `/vagas-{município}` | 417 | Páginas por município da Bahia |

### Rota Catch-All

| Rota | Página |
|---|---|
| `*` | `NotFound` (404) |

---

## SEO e Indexação

### Meta Tags

- **Title**: `Vagas na Bahia: Empresas Contratando com Atualização Diária`
- **Description**: Descrição otimizada para buscas de emprego na Bahia
- **Canonical**: Todas as páginas apontam para `https://bahiavagas.com`
- **Open Graph**: Configurado para Facebook, LinkedIn, WhatsApp
- **Twitter Card**: Configurado com summary card

### Redirect de Domínio

O `index.html` contém um script que:
1. Detecta acesso via `lovable.app`
2. Injeta `<meta name="robots" content="noindex, nofollow">`
3. Redireciona para `https://bahiavagas.com`

### Sitemap

- **URL**: `https://bahiavagas.com/functions/v1/sitemap`
- Gerado dinamicamente via Edge Function
- Inclui todas as páginas estáticas, dinâmicas e de conteúdo
- Atualizado automaticamente com novas vagas e posts

### robots.txt

Localizado em `public/robots.txt` com referência ao sitemap.

### Google Analytics

- **ID**: `G-WR7P9Y062M`
- Integrado via Google Tag Manager no `index.html`

### SEO Programático

O sistema gera automaticamente **180+ páginas** combinando:
- **10 profissões**: vendedor, auxiliar administrativo, recepcionista, atendente, operador de caixa, motorista, estoquista, analista de marketing, auxiliar de serviços gerais, telemarketing
- **10 cidades**: Salvador, Feira de Santana, Vitória da Conquista, Luís Eduardo Magalhães, Ilhéus, Itabuna, Camaçari, Juazeiro, Barreiras, Porto Seguro
- **8 tipos**: emprego, vaga, trabalho, vagas hoje, vagas urgentes, sem experiência, jovem aprendiz, home office

Cada página inclui conteúdo introdutório otimizado, links internos e listagem de vagas reais.

### Meta Tags Dinâmicas

A tabela `meta_tags` permite configurar title, description e OG tags por página via painel admin.

---

## Autenticação e Segurança

### Fluxo de Autenticação

1. **Cadastro**: E-mail + senha com confirmação por e-mail
2. **Login**: E-mail + senha
3. **Roles**: `candidate`, `company`, `admin` (tabela separada `user_roles`)
4. **Perfil automático**: Criado após confirmação de e-mail

### Segurança

- **RLS em todas as tabelas**: Cada tabela possui políticas específicas
- **Função `has_role`**: SECURITY DEFINER para evitar recursão RLS
- **Validação de CNPJ**: Via Edge Function dedicada
- **IP Hashing**: SHA-256 com salt para analytics (sem armazenar IPs reais)
- **Auto-confirm desabilitado**: Usuários devem confirmar e-mail

### Secrets Configurados

| Nome | Descrição |
|---|---|
| `LOVABLE_API_KEY` | *(Legado)* Só era usada pela Edge `auth-email-hook` com Lovable; **não necessária** se o Auth enviar e-mail pelo Supabase (ver `docs/supabase-auth-email.md`). |
| `RAPIDAPI_KEY` | Chave para JSearch API (importação de vagas) |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave anônima |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (admin) |
| `SUPABASE_DB_URL` | URL de conexão do banco |
| `SUPABASE_PUBLISHABLE_KEY` | Chave publicável |

---

## Analytics Interno

O BahiaVagas possui um sistema de analytics próprio, independente do Google Analytics.

### Arquitetura

```
[Usuário navega] → [useAnalyticsTracker hook] → [Edge Function track-visit] → [PostgreSQL]
                                                                                    ↓
[Admin acessa /admin/analytics] → [React Query + Recharts] ← [Supabase SDK] ← [Tabelas analytics_*]
```

### Funcionalidades

- Usuários online em tempo real
- Visitantes novos vs recorrentes
- Geolocalização (país, estado, cidade)
- Dispositivos (mobile, desktop, tablet)
- Navegadores e sistemas operacionais
- Páginas mais acessadas
- Tempo de permanência
- Origem do tráfego (referrer)
- Filtro de administradores
- Exportação CSV
- Auto-refresh a cada 30 segundos

---

## Integrações Externas

| Serviço | Uso |
|---|---|
| **JSearch API (RapidAPI)** | Importação automática de vagas de emprego |
| **Google Analytics (G-WR7P9Y062M)** | Analytics externo |
| **Cloudflare** | Headers de geolocalização para analytics |
| **Supabase** | PostgreSQL, Auth (e-mail via painel/SMTP), Storage, Edge Functions opcionais |

---

## Como Executar

### Pré-requisitos

- Node.js (v18+)
- npm ou bun

### Instalação

```bash
# Clonar o repositório
git clone <URL_DO_REPOSITORIO>
cd bahiavagas

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `vite` | Servidor de desenvolvimento (porta 8080) |
| `build` | `vite build` | Build de produção |
| `build:dev` | `vite build --mode development` | Build de desenvolvimento |
| `lint` | `eslint .` | Verificação de código |
| `preview` | `vite preview` | Preview do build |

### Variáveis de Ambiente

As variáveis são gerenciadas automaticamente pelo Lovable Cloud:

```
VITE_SUPABASE_URL=<url-do-projeto>
VITE_SUPABASE_PUBLISHABLE_KEY=<chave-anon>
VITE_SUPABASE_PROJECT_ID=<id-do-projeto>
```

---

## Licença

Projeto privado — todos os direitos reservados.

---

> **BahiaVagas** — Conectando talentos às melhores oportunidades na Bahia. 🇧🇷
