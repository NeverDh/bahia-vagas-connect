# Deploy — BahiaVagas

Guia de hospedagem em produção para o portal **BahiaVagas** (`https://bahiavagas.com`).

---

## Arquitetura

O projeto tem **três camadas** em produção:

```
[Usuário] → bahiavagas.com
              ├── Frontend (React + Vite) — arquivos estáticos
              └── API NestJS — Node 20+, porta 3000
                        ↓
              Supabase (já contratado)
                ├── PostgreSQL (DATABASE_URL)
                ├── Auth (login/cadastro)
                └── Storage (currículos)
                        ↓
              Adzuna API (importação automática de vagas — Bahia)
```

| Componente | Tecnologia | Onde hospedar |
|------------|------------|---------------|
| Frontend | React + Vite (SPA) | Cloudflare Pages, Vercel, Netlify ou nginx (VPS) |
| API | NestJS (`/api`) | Railway, Render, Fly.io ou VPS |
| Banco + Auth + Storage | Supabase | Já configurado |
| Importação de vagas | Adzuna API | Chaves no servidor (`api/.env`) |
| Cron (1h) | NestJS `@Cron` ou Supabase `pg_cron` | Ver seção [Cron automático](#cron-automático) |

---

## O que já está no Supabase

Não é necessário contratar outro banco. O Supabase já fornece:

- PostgreSQL (conexão via `DATABASE_URL` no `api/.env`)
- Autenticação (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- Storage (bucket `resumes` para currículos)
- Extensões `pg_cron` + `pg_net` (agendamento HTTP)

---

## Opções de hospedagem

### Opção A — Recomendada para começar (PaaS + CDN)

| Serviço | Função | Custo aproximado |
|---------|--------|------------------|
| **Supabase** | Banco, auth, storage | Free → ~US$ 25/mês (Pro) |
| **Cloudflare Pages** ou **Vercel** | Frontend estático | Grátis / barato |
| **Railway** ou **Render** | API NestJS 24/7 | ~US$ 5–15/mês |
| **Domínio** `bahiavagas.com` | DNS | ~R$ 40/ano |

**Vantagens:** deploy rápido, sem administrar servidor.  
**Desvantagens:** menos controle; a API precisa de plano que mantenha o processo ligado.

### Opção B — VPS (controle total)

| Serviço | Função | Custo aproximado |
|---------|--------|------------------|
| **Supabase** | Banco, auth, storage | Como acima |
| **VPS** (Hetzner, DigitalOcean, Hostinger BR) | Frontend + API | €4–12 / ~R$ 30–80/mês |
| **Domínio** | DNS | ~R$ 40/ano |

Na VPS, use:

- **nginx** — serve o `dist/` do frontend e faz proxy reverso para a API
- **PM2** ou **Docker** — mantém o NestJS rodando
- **Certbot** — HTTPS (Let's Encrypt)

**Vantagens:** um servidor só, custo previsível, cron interno simples.  
**Desvantagens:** você gerencia updates, firewall e backups.

### Comparativo rápido

| | VPS | Railway / Render |
|---|-----|------------------|
| Dificuldade | Maior | Menor |
| Manutenção | Sua | Da plataforma |
| Ideal para | Controle e escala manual | **Subir rápido** |

**Sugestão inicial:** Supabase + Cloudflare Pages (frontend) + Railway (API). Migre para VPS quando o tráfego justificar.

---

## Passo a passo — deploy

### 1. Supabase

1. Confirme o projeto ativo e as chaves em **Project Settings → API**.
2. Use **Session Pooler** na `DATABASE_URL` se houver problema de IPv4 (região `sa-east-1`).
3. Aplique migrations pendentes, incluindo o cron:

   `supabase/migrations/20260612030000_schedule_adzuna_import_cron.sql`

   Via CLI: `supabase db push`  
   Ou cole o SQL no **SQL Editor** do painel.

4. Em produção, configure o cron do Supabase (após a API ter URL pública):

```sql
INSERT INTO public.cron_config (key, value) VALUES
  ('import_api_url', 'https://api.bahiavagas.com/api/cron/jobs/import'),
  ('cron_secret', 'SEU_CRON_SECRET_IGUAL_AO_API_ENV')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
```

---

### 2. API NestJS (exemplo: Railway)

1. Conecte o repositório GitHub à plataforma.
2. **Root directory:** `api/`
3. **Node:** 20 ou 24
4. **Build:** `npm ci && npm run build`
5. **Start:** `npm run start:prod`
6. Configure as variáveis de ambiente (seção abaixo).
7. Anote a URL pública, ex.: `https://bahiavagas-api.up.railway.app`

**Render / Fly.io:** mesma lógica — processo Node persistente, build Nest, variáveis do `api/.env`.

---

### 3. Frontend (exemplo: Cloudflare Pages)

1. Conecte o repositório.
2. **Build command:** `npm ci && npm run build`
3. **Output directory:** `dist`
4. Variáveis de build (seção abaixo).
5. Domínio customizado: `bahiavagas.com` e `www.bahiavagas.com`.

**Importante:** variáveis `VITE_*` são embutidas no build. Ao mudar `VITE_API_URL`, é necessário **novo deploy** do frontend.

---

### 4. DNS sugerido

| Registro | Destino |
|----------|---------|
| `bahiavagas.com` | Cloudflare Pages / Vercel (frontend) |
| `www.bahiavagas.com` | Mesmo do apex ou redirect |
| `api.bahiavagas.com` | Railway / VPS (API NestJS) |

---

### 5. CORS na API

Em produção, adicione o domínio real em `api/src/main.ts` (`enableCors` → `origin`), se ainda não estiver:

- `https://bahiavagas.com`
- `https://www.bahiavagas.com`

---

## Variáveis de ambiente

### Frontend (build time — `.env` na raiz ou painel da plataforma)

```env
VITE_SUPABASE_URL=https://SEU_REF.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_publishable
VITE_API_URL=https://api.bahiavagas.com
```

**Nunca** coloque `SUPABASE_SERVICE_ROLE_KEY` ou `CRON_SECRET` no frontend.

---

### API (runtime — `api/.env` ou secrets da plataforma)

```env
PORT=3000
NODE_ENV=production

# Supabase
SUPABASE_URL=https://SEU_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# PostgreSQL (Session Pooler recomendado)
DATABASE_URL=postgresql://postgres.SEU_REF:SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres

# Adzuna — https://developer.adzuna.com/
ADZUNA_APP_ID=seu_app_id
ADZUNA_APP_KEY=seu_app_key
ADZUNA_MAX_DAYS_OLD=30

# Cron: use UM dos modos abaixo (ver seção Cron)
ADZUNA_CRON_ENABLED=false
CRON_SECRET=gere_um_segredo_longo_aleatorio
```

---

## Cron automático

A importação Adzuna roda **a cada hora** e busca as **50 vagas mais recentes da Bahia** (`where=Bahia`, `sort_by=date`), inserindo apenas as novas.

### Modo 1 — NestJS (desenvolvimento ou API sempre ligada)

```env
ADZUNA_CRON_ENABLED=true
```

A API dispara `@Cron` a cada hora enquanto o processo estiver ativo. Funciona em local/dev, mas **não** dependa só disso se a API hibernar no plano free de algum PaaS.

### Modo 2 — Supabase `pg_cron` (recomendado em produção)

1. Migration `20260612030000_schedule_adzuna_import_cron.sql` aplicada.
2. Tabela `cron_config` preenchida com `import_api_url` e `cron_secret`.
3. Na API: `ADZUNA_CRON_ENABLED=false` (evita importação duplicada).

O Supabase chama:

```http
POST https://api.bahiavagas.com/api/cron/jobs/import
X-Cron-Secret: SEU_CRON_SECRET
```

**Nota:** `pg_cron` no Supabase **não alcança** `localhost` — a API precisa de URL pública com HTTPS.

### Importação manual (admin)

Painel admin → **Importar vagas**, ou:

```http
POST /api/admin/jobs/import
Authorization: Bearer <token_admin>
```

---

## Limites da API Adzuna (plano gratuito)

| Período | Limite |
|---------|--------|
| Por minuto | 25 requisições |
| Por dia | 250 |
| Por semana | 1.000 |
| **Por mês** | **2.500** |

Com cron **1 req/hora** ≈ **720 req/mês** — dentro do free tier.

Cada execução importa até **50 vagas** (máximo oficial `results_per_page` da Adzuna).

Documentação oficial: [developer.adzuna.com](https://developer.adzuna.com/docs/terms_of_service)

---

## Custos mensais estimados

| Cenário | Total aproximado |
|---------|------------------|
| Mínimo (free tiers) | R$ 0–50 (principalmente domínio) |
| Recomendado (Supabase + API + CDN) | R$ 80–150 |
| VPS completa | R$ 50–120 |

---

## Checklist antes de ir ao ar

- [ ] `DATABASE_URL` com Session Pooler e senha correta
- [ ] `VITE_API_URL` apontando para a API em produção
- [ ] CORS da API com domínio `bahiavagas.com`
- [ ] HTTPS em frontend e API
- [ ] `CRON_SECRET` forte e igual no `api/.env` e em `cron_config`
- [ ] Migration do `pg_cron` aplicada (produção)
- [ ] `ADZUNA_CRON_ENABLED=false` se usar só Supabase cron
- [ ] Secrets **não** commitados no Git (`.env` no `.gitignore`)
- [ ] Conta admin criada para testes no painel

---

## VPS — esboço de configuração nginx

Exemplo mínimo (ajuste caminhos e domínios):

```nginx
server {
    listen 443 ssl http2;
    server_name bahiavagas.com www.bahiavagas.com;

    root /var/www/bahiavagas/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 443 ssl http2;
    server_name api.bahiavagas.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

API com PM2:

```bash
cd /var/www/bahiavagas/api
nvm use 24
npm ci && npm run build
pm2 start dist/main.js --name bahiavagas-api
pm2 save
```

---

## Avisos legais e operacionais

### Adzuna

Publicar vagas importadas da Adzuna em um site comercial pode exigir **parceria ou licença**. Consulte os [Termos de Serviço da API Adzuna](https://developer.adzuna.com/docs/terms_of_service) antes de escalar o tráfego.

### Segurança

- `SUPABASE_SERVICE_ROLE_KEY` e `CRON_SECRET` ficam **somente** no servidor (`api/.env`).
- Não exponha `DATABASE_URL` no frontend ou em repositório público.
- Em produção, desative `synchronize: true` no TypeORM e use migrations.

---

## Referências no repositório

| Arquivo | Conteúdo |
|---------|----------|
| `api/README.md` | Visão geral da API NestJS |
| `api/src/jobs/adzuna-import.service.ts` | Lógica de importação Adzuna |
| `api/src/cron/` | Cron NestJS + endpoint `/api/cron/jobs/import` |
| `supabase/migrations/20260612030000_schedule_adzuna_import_cron.sql` | Job `pg_cron` horário |
| `README.md` | Documentação geral do projeto |

---

> **BahiaVagas** — Deploy: Supabase (dados) + CDN (frontend) + Node 24 (API) + cron horário (Adzuna / Bahia).
