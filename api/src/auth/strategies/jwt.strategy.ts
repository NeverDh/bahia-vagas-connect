/**
 * Tipos do usuário autenticado após validar o Bearer com o Supabase (`auth.getUser`).
 * Mantidos neste ficheiro para não quebrar imports existentes (`jwt.strategy.js`).
 */

/** Claims típicos do JWT GoTrue (referência; validação é feita pelo Supabase). */
export interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  aud?: string | string[];
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  exp?: number;
  iat?: number;
}

/** Anexado a `req.user` após `JwtAuthGuard`. */
export interface JwtValidatedUser {
  userId: string;
  email?: string;
  role?: string;
  user_metadata: Record<string, unknown>;
}
