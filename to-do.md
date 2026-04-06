# 🎯 Objective

Analisar profundamente o projeto "BahiaVagas", entender completamente sua arquitetura atual (frontend + Supabase/Lovable backend) e preparar um plano técnico para migração para um backend próprio mais seguro e robusto. LEIA TODO O README.MD PRIMEIRO.

O objetivo NÃO é apenas entender, mas:
- Mapear tudo ponta a ponta
- Identificar riscos de segurança
- Entender regras de negócio implícitas
- Preparar base para criação de um novo backend

---

# 🏗️ System Context

## Projeto: BahiaVagas
- Tipo: SPA (Single Page Application)
- Domínio: https://bahiavagas.com

## Frontend
- React 18 + TypeScript + Vite
- Comunicação direta com Supabase (sem backend intermediário)
- Uso intensivo de:
  - React Query
  - Hooks customizados
  - Edge Functions

## Backend atual (Lovable / Supabase)
- PostgreSQL com RLS
- Edge Functions (Deno)
- Auth integrado (Supabase Auth)
- Storage (currículos, imagens)
- APIs serverless

## Problema atual
- Backend não é controlado diretamente (Lovable)
- Risco de segurança e limitação de controle
- Necessidade de migrar para backend próprio (ex: NestJS, Node, etc.)

---

# 🤖 Agents to Use

## 1. Explorer Agent (PRIMARY)
Modo:
- Mapping Mode
- Audit Mode
- Socratic Discovery Protocol (OBRIGATÓRIO)

Responsável por:
- Entender 100% da codebase
- Mapear fluxo real de dados
- Identificar dependências críticas
- Descobrir regras de negócio ocultas
- Detectar riscos de segurança

---

## 2. Project Planner Agent
Responsável por:
- Criar arquitetura futura do backend
- Definir estratégia de migração
- Propor estrutura escalável
- Separar responsabilidades (frontend vs backend)

---

## 3. Backend Architect Agent (NOVO - CRÍTICO)
Responsável por:
- Projetar novo backend (ex: NestJS)
- Definir:
  - Controllers
  - Services
  - Repositories
  - Auth
  - Integrações
- Substituir completamente Supabase

---

## 4. Documentation Agent
Responsável por:
- Criar documentação técnica completa
- Criar documentação simplificada (não técnica)
- Explicar fluxo do sistema atual e futuro

---