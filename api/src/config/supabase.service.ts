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
 */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private adminClient!: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Inicializa o cliente Supabase na inicialização do módulo.
   * Valida que as variáveis de ambiente necessárias existem.
   *
   * @throws Error se SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não estão definidas
   */
  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias. ' +
        'Verifique o arquivo .env',
      );
    }

    this.adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('✅ Supabase admin client initialized');
  }

  /**
   * Retorna o cliente Supabase com SERVICE_ROLE_KEY.
   * 
   * ⚠️ Este cliente BYPASSA políticas RLS.
   * Usar com cuidado — sempre validar autorizações no service layer.
   *
   * @returns SupabaseClient configurado com service_role
   *
   * @example
   * const supabase = this.supabaseService.getAdminClient();
   * const { data } = await supabase.from('jobs').select('*');
   */
  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }
}
