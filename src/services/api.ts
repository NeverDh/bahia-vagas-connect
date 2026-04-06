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

// Base URL do backend NestJS (configurada via env var)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

/**
 * Obtém o token JWT do localStorage (set pelo auth flow).
 * Retorna null se não estiver autenticado.
 */
function getAuthToken(): string | null {
  // O token será armazenado pelo auth flow quando implementado
  return localStorage.getItem('bahiavagas_token');
}

/**
 * Faz uma requisição HTTP ao backend NestJS.
 *
 * Adiciona automaticamente:
 * - Content-Type: application/json
 * - Authorization: Bearer <token> (se logado)
 *
 * @param endpoint - Caminho relativo do endpoint (ex: "/api/jobs")
 * @param options - Opções adicionais do fetch (method, body, etc.)
 * @returns Dados da resposta parseados como JSON
 * @throws ApiRequestError se o servidor retornar um erro
 *
 * @example
 * // GET simples
 * const jobs = await api('/api/jobs');
 *
 * // POST com body
 * const result = await api('/api/auth/signin', {
 *   method: 'POST',
 *   body: JSON.stringify({ email, password }),
 * });
 *
 * // GET com query params
 * const filtered = await api('/api/jobs?q=vendedor&location=Salvador');
 */
async function api<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Se não há conteúdo (204 No Content), retorna vazio
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiRequestError(response.status, data as ApiError);
  }

  return data as T;
}

// ── Métodos de conveniência ──────────────────────────────────

/** GET request */
api.get = <T = unknown>(endpoint: string) => api<T>(endpoint);

/** POST request com body */
api.post = <T = unknown>(endpoint: string, body?: unknown) =>
  api<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });

/** PUT request com body */
api.put = <T = unknown>(endpoint: string, body?: unknown) =>
  api<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });

/** PATCH request com body parcial */
api.patch = <T = unknown>(endpoint: string, body?: unknown) =>
  api<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });

/** DELETE request */
api.delete = <T = unknown>(endpoint: string) =>
  api<T>(endpoint, { method: 'DELETE' });

export { api };
export default api;
