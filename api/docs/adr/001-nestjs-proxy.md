# ADR-001: NestJS como Proxy para Supabase

## Status
**Aceito** — 2026-04-06

## Contexto

O frontend React do BahiaVagas se comunicava diretamente com o Supabase usando a `anon_key` exposta no bundle JavaScript do browser. Foram identificados 12 riscos de segurança, sendo 3 críticos:

1. **Chaves expostas no browser** — `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` estavam no bundle JS
2. **Analytics RLS super permissivo** — `INSERT` e `UPDATE` liberados para `public` em todas as tabelas analytics
3. **Edge Functions sem autenticação** — `import-jobs` não verificava JWT nem role admin

Além disso, 15+ arquivos no frontend faziam queries diretas ao Supabase, criando acoplamento forte e tornando impossível trocar de backend no futuro.

## Decisão

Criar um backend **NestJS** que atua como **API proxy** entre o frontend e o Supabase:

- O frontend faz requisições REST ao NestJS
- O NestJS usa o Supabase SDK com `SERVICE_ROLE_KEY` (server-side only)
- O Supabase é mantido como infraestrutura (Auth, DB, Storage, Edge Functions)
- O frontend NÃO terá mais acesso direto ao Supabase

### Alternativas consideradas

| Alternativa | Motivo da rejeição |
|---|---|
| Manter Supabase direto + melhorar RLS | Não resolve exposição de chaves, não centraliza business logic |
| Substituir Supabase completamente | Complexidade excessiva, perda de funcionalidades prontas (Auth, Storage) |
| Next.js API Routes | Requereria migrar o frontend de Vite para Next.js |
| Express.js puro | Menos estruturado, sem DI, menos produtivo para equipe |

## Consequências

### Positivas
- Chaves sensíveis ficam SOMENTE no servidor
- Business logic centralizada e testável
- Frontend desacoplado do Supabase (pode trocar DB no futuro)
- Rate limiting, CORS, logging controlados pelo backend
- Swagger documenta 100% dos endpoints

### Negativas
- Adiciona latência de um hop (React → NestJS → Supabase)
- Backend precisa ser mantido/deployado separadamente
- Complexidade operacional maior (mais um serviço para monitorar)

### Riscos
- Se o NestJS cair, o frontend fica sem backend (mitigação: health checks + auto-restart)
- Hospedagem Hostinger tem limitações de recursos (mitigação: backend leve, sem heavy processing)
