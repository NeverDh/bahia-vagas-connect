/**
 * API Client — Cliente HTTP centralizado para o BahiaVagas.
 *
 * ESTE ARQUIVO É O PONTO ÚNICO DE COMUNICAÇÃO DO FRONTEND COM O BACKEND.
 * Todas as chamadas que antes iam diretamente ao Supabase agora passam
 * por aqui, que encaminha para o backend NestJS.
 *
 * @see docs/api-mapping.md — Mapa completo de endpoints
 * @see docs/migration-log.md — Histórico de refatoração
 */

import { beginApiRequest, endApiRequest } from './api-loading-bus';

/** Formato padrão de resposta de erro da API */
interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

/** Formato padrão de resposta paginada */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ApiFetchOptions = RequestInit & {
  /** Não aciona a barra global de loading (polling, analytics, etc.) */
  skipGlobalLoading?: boolean;
  /**
   * Se true, 401 não limpa tokens nem dispara `SESSION_INVALID_EVENT`.
   * Use só em chamadas opcionais de enriquecimento (ex.: “já me candidatei?” na listagem),
   * onde o try/catch já ignora o erro — evita logout ao abrir Vagas com JWT ainda não aceito pelo Nest.
   */
  skipSessionInvalidOn401?: boolean;
};

// Base URL do backend NestJS (configurada via env var)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Requisições em segundo plano que não devem piscar a barra de loading.
 */
function endpointPath(endpoint: string): string {
  return endpoint.split('?')[0] ?? endpoint;
}

/**
 * Login/cadastro são anônimos: não enviar Bearer (token velho confundiria o backend)
 * e 401 aqui significa credenciais/validação, não "sessão expirada".
 */
function isCredentialAuthEndpoint(endpoint: string, method: string): boolean {
  const path = endpointPath(endpoint);
  const m = method.toUpperCase();
  return (
    m === 'POST' &&
    (path === '/api/auth/login' || path === '/api/auth/signup')
  );
}

function shouldSkipAutoLoading(
  endpoint: string,
  method: string,
  explicit?: boolean,
): boolean {
  if (explicit) return true;
  const path = endpointPath(endpoint);
  if (path === '/api/auth/me') return true;
  if (path.startsWith('/api/meta-tags')) return true;
  if (path === '/api/analytics/track') return true;
  if (method === 'POST' && /\/api\/blog\/[^/]+\/view$/.test(path)) return true;
  return false;
}

/**
 * Classe de erro customizada para respostas da API.
 * Contém o statusCode e mensagem formatada.
 */
export class ApiRequestError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorData: ApiError,
  ) {
    const msg = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message;
    super(msg);
    this.name = 'ApiRequestError';
  }
}

/** Disparado quando a API retorna 401 e havia token salvo (sessão inválida/expirada). */
export const SESSION_INVALID_EVENT = 'bahiavagas:session-invalid';

/** Chave do access token (JWT Supabase) no `localStorage`. */
export const AUTH_ACCESS_TOKEN_KEY = 'bahiavagas_token';

/** Chave do refresh token no `localStorage` (renovação futura no backend). */
export const AUTH_REFRESH_TOKEN_KEY = 'bahiavagas_refresh_token';

/**
 * Persiste tokens após login/signup com sessão.
 */
export function setStoredAuthTokens(
  accessToken: string | null,
  refreshToken?: string | null,
): void {
  if (accessToken) {
    localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken);
  } else {
    localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
  }
  if (refreshToken !== undefined) {
    if (refreshToken) {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    }
  }
}

/** Remove access e refresh tokens. */
export function clearStoredAuthTokens(): void {
  localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
}

/**
 * Obtém o token JWT do localStorage (definido pelo fluxo de auth em `useAuth`).
 */
function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
}

/**
 * Faz uma requisição HTTP ao backend NestJS.
 *
 * Adiciona automaticamente:
 * - Content-Type: application/json (exceto se `body` for `FormData`)
 * - Authorization: Bearer <token> (se logado)
 *
 * @param endpoint - Caminho relativo do endpoint (ex: "/api/jobs")
 * @param options - Opções do fetch; use `skipGlobalLoading: true` para não mostrar a barra global
 */
async function api<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipGlobalLoading, skipSessionInvalidOn401, ...fetchInit } = options;
  const method = (fetchInit.method ?? 'GET').toUpperCase();
  const trackLoading = !shouldSkipAutoLoading(
    endpoint,
    method,
    skipGlobalLoading,
  );

  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  const sendBearer =
    Boolean(token) && !isCredentialAuthEndpoint(endpoint, method);
  const hadAuthHeader = sendBearer;

  const isFormData =
    typeof FormData !== 'undefined' && fetchInit.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...((fetchInit.headers as Record<string, string>) || {}),
  };

  if (sendBearer) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (trackLoading) beginApiRequest();
  try {
    const response = await fetch(url, {
      ...fetchInit,
      headers,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
      if (
        response.status === 401 &&
        hadAuthHeader &&
        typeof window !== 'undefined' &&
        !isCredentialAuthEndpoint(endpoint, method) &&
        !skipSessionInvalidOn401
      ) {
        clearStoredAuthTokens();
        window.dispatchEvent(new CustomEvent(SESSION_INVALID_EVENT));
      }
      throw new ApiRequestError(response.status, data as ApiError);
    }

    return data as T;
  } finally {
    if (trackLoading) endApiRequest();
  }
}

type LoadingOpt = Pick<
  ApiFetchOptions,
  'skipGlobalLoading' | 'skipSessionInvalidOn401'
>;

// ── Métodos de conveniência ──────────────────────────────────

/** GET request */
api.get = <T = unknown>(endpoint: string, opts?: LoadingOpt) =>
  api<T>(endpoint, { method: 'GET', ...opts });

/** POST request com body */
api.post = <T = unknown>(
  endpoint: string,
  body?: unknown,
  opts?: LoadingOpt,
) =>
  api<T>(endpoint, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...opts,
  });

/** POST multipart (ex.: candidatura com currículo). Não define Content-Type (boundary automático). */
api.postFormData = <T = unknown>(
  endpoint: string,
  formData: FormData,
  opts?: LoadingOpt,
) => api<T>(endpoint, { method: 'POST', body: formData, ...opts });

/** PUT request com body */
api.put = <T = unknown>(endpoint: string, body?: unknown, opts?: LoadingOpt) =>
  api<T>(endpoint, {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...opts,
  });

/** PATCH request com body parcial */
api.patch = <T = unknown>(
  endpoint: string,
  body?: unknown,
  opts?: LoadingOpt,
) =>
  api<T>(endpoint, {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...opts,
  });

/** DELETE request */
api.delete = <T = unknown>(endpoint: string, opts?: LoadingOpt) =>
  api<T>(endpoint, { method: 'DELETE', ...opts });

export { api };
export default api;
