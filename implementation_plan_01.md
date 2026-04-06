# 🏗️ BahiaVagas Migration - Module 1: Authentication (auth/)

Following the successful setup of the project, entities, and database connection (Pooler AWS-1-SA-EAST-1), we are now moving to **Module 1: Authentication**.

The goal is to move all Auth-related business logic from the frontend to the backend, using NestJS as a secure proxy to Supabase Auth.

## 📝 User Review Required

> [!IMPORTANT]
> **Auth Proxy Architecture**: The frontend will stop calling `supabase.auth` directly. Instead:
> 1. Frontend calls `api.post("/api/auth/login")`.
> 2. Backend calls `supabase.auth.signInWithPassword`.
> 3. Backend performs `fetchUserRole` and `ensureUserProfile`.
> 4. Backend returns the `Session` (including the Access Token) to the frontend.

> [!WARNING]
> **JWT Validation (Server-Side)**: We will implement a `JwtStrategy` using `passport-jwt`. This strategy will validate the JWT sent by the frontend using your project's JWT Secret (this ensures we can identify the user on the server for protected routes like `/jobs/create`).

## 📦 Proposed Changes

### 1. Backend: Authentication Module

#### [NEW] [auth.module.ts](file:///c:/Users/luis.gabriel/Documents/bahia-vagas-connect/api/src/auth/auth.module.ts)
- Main entry point for auth.
- Configures `PassportModule` and `JwtModule`.
- Imports `SupabaseModule` and `TypeOrmModule` for entity access.

#### [NEW] [auth.controller.ts](file:///c:/Users/luis.gabriel/Documents/bahia-vagas-connect/api/src/auth/auth.controller.ts)
- `POST /api/auth/signup`: Handle user registration (Candidate/Company).
- `POST /api/auth/login`: Handle user login.
- `GET /api/auth/me`: Protected route returning user data + role.
- `POST /api/auth/logout`: Logout endpoint.

#### [NEW] [auth.service.ts](file:///c:/Users/luis.gabriel/Documents/bahia-vagas-connect/api/src/auth/auth.service.ts)
- Proxy calls to `supabase.auth`.
- **Logic Migration**: Migrates `ensureUserProfile` (profile creation) and `fetchUserRole` (role detection) from the frontend.
- **Logic Migration**: Migrates `translateError` (error message mapping) from the frontend.

#### [NEW] [jwt.strategy.ts](file:///c:/Users/luis.gabriel/Documents/bahia-vagas-connect/api/src/auth/strategies/jwt.strategy.ts)
- Custom Passport strategy to extract and validate the Supabase JWT.

#### [NEW] [guards & decorators](file:///c:/Users/luis.gabriel/Documents/bahia-vagas-connect/api/src/common/)
- `JwtAuthGuard`: Protects controllers.
- `RolesGuard`: RBAC (Candidate vs Company vs Admin).
- `@Roles()` & `@CurrentUser()` decorators.

---

### 2. Frontend: Auth Hook Refactoring

#### [MODIFY] [useAuth.tsx](file:///c:/Users/luis.gabriel/Documents/bahia-vagas-connect/src/hooks/useAuth.tsx)
- Refactor `signUp`, `signIn`, and `signOut` to use the new `api.ts` client.
- Replace internal logic with simple calls to the backend.
- Update session initialization to fetch role from `/api/auth/me`.

## 🧪 Verification Plan

### Automated Tests
1. `npm test`: Run unit tests for `AuthService`.
2. Manual endpoint tests using the Swagger UI (`/api/docs`).

### Manual Verification
1. **Signup**: Create a new account and verify that:
   - User appears in Supabase Auth.
   - Corresponding profile created (Candidate or Company).
   - Role created in `user_roles`.
2. **Login**: Login with the new account and verify:
   - Frontend correctly receives the session and role.
   - User is redirected to the home/dashboard.
3. **Protected Routes**: Try to access `/api/auth/me` without a token (should fail) and with a token (should succeed).
