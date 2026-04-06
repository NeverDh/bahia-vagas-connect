# 📝 Migration Log — Frontend Refactoring

> Registro de cada arquivo do frontend refatorado para usar o backend NestJS
> ao invés de comunicação direta com o Supabase.

---

## Formato de Cada Entrada

```
### [Nome do Arquivo]
- **Data**: YYYY-MM-DD
- **Antes**: O que o arquivo fazia (Supabase direto)
- **Depois**: Como funciona agora (via backend REST)
- **Motivo**: Por que a mudança foi feita
- **Impacto**: Outros arquivos afetados
```

---

## Entradas

> Nenhuma migração realizada ainda. Entradas serão adicionadas conforme cada arquivo for refatorado.

<!-- Template para copiar:

### src/hooks/useAuth.tsx
- **Data**: 2026-04-XX
- **Antes**: Usava `supabase.auth.signUp()`, `signInWithPassword()`, `signOut()` e queries diretas para `candidate_profiles`, `companies`, `user_roles`
- **Depois**: Usa `api.post("/api/auth/signup")`, `api.post("/api/auth/signin")`, etc.
- **Motivo**: Remover anon_key exposta no browser, centralizar auth no backend
- **Impacto**: useAdmin.ts (agora usa campo isAdmin do /api/auth/me)

-->
