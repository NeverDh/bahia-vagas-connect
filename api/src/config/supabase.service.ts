/**
 * SupabaseService — Wrapper tipado para o cliente Supabase.
 *
 * Provê dois clientes:
 * - getAdminClient(): Usa SERVICE_ROLE_KEY — acesso total, bypassa RLS.
 *   Usar para operações administrativas e server-side.
 * - getAnonClient(): Usa ANON_KEY — respeita RLS policies.
 *   Usar quando quiser simular o comportamento do frontend.
 *
 * SEGURANÇA: A SERVICE_ROLE_KEY NUNCA deve ser exposta ao frontend.
 * Ela só existe neste backend server-side.
 *
 * HTTP: usa `fetch` do pacote `undici` com `Agent` e `connectTimeout` alto.
 * O `fetch` global do Node aplica ~10s só para TCP connect; `AbortSignal` não altera isso.
 */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Agent, fetch as undiciFetch } from 'undici';

function parseMs(env: string | undefined, fallback: number): number {
  const n = parseInt(env ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Fetch compatível com Supabase: timeouts de conexão/corpo do Undici + teto AbortSignal.
 */
function createSupabaseFetch(opts: {
  connectTimeoutMs: number;
  headersTimeoutMs: number;
  bodyTimeoutMs: number;
  requestSignalMs: number;
}): typeof fetch {
  const agent = new Agent({
    connectTimeout: opts.connectTimeoutMs,
    headersTimeout: opts.headersTimeoutMs,
    bodyTimeout: opts.bodyTimeoutMs,
  });

  const boundFetch = (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const userSignal = init?.signal;
    const deadline = AbortSignal.timeout(opts.requestSignalMs);
    const signal =
      userSignal && typeof AbortSignal.any === 'function'
        ? AbortSignal.any([userSignal, deadline])
        : deadline;
    return undiciFetch(
      input as Parameters<typeof undiciFetch>[0],
      {
        ...(init ?? {}),
        signal,
        dispatcher: agent,
      } as Parameters<typeof undiciFetch>[1],
    ) as unknown as Promise<Response>;
  };

  return boundFetch as typeof fetch;
}

@Injectable()
export class SupabaseService implements OnModuleInit {
  private adminClient!: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias. ' +
          'Verifique o arquivo .env',
      );
    }

    const connectTimeoutMs = parseMs(
      this.configService.get<string>('SUPABASE_CONNECT_TIMEOUT_MS'),
      60_000,
    );
    const headersTimeoutMs = parseMs(
      this.configService.get<string>('SUPABASE_HEADERS_TIMEOUT_MS'),
      120_000,
    );
    const bodyTimeoutMs = parseMs(
      this.configService.get<string>('SUPABASE_BODY_TIMEOUT_MS'),
      120_000,
    );
    const requestSignalMs = Math.max(
      connectTimeoutMs + 30_000,
      parseMs(
        this.configService.get<string>('SUPABASE_FETCH_TIMEOUT_MS'),
        120_000,
      ),
    );

    const customFetch = createSupabaseFetch({
      connectTimeoutMs,
      headersTimeoutMs,
      bodyTimeoutMs,
      requestSignalMs,
    });

    this.adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        fetch: customFetch,
      },
    });

    this.logger.log(
      `✅ Supabase client: connectTimeout=${connectTimeoutMs}ms, signal=${requestSignalMs}ms (env: SUPABASE_CONNECT_TIMEOUT_MS, SUPABASE_FETCH_TIMEOUT_MS)`,
    );
  }

  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }
}
