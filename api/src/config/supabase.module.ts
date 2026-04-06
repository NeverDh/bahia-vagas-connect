/**
 * SupabaseModule — Módulo global que provê o cliente Supabase via DI.
 *
 * Usa a SERVICE_ROLE_KEY (não a anon key) para acesso completo ao banco.
 * Isso é seguro porque o backend roda server-side, nunca expõe a key.
 *
 * DECISÃO: Usamos o Supabase SDK ao invés de TypeORM direto para
 * manter compatibilidade com RLS policies existentes e Edge Functions.
 * TypeORM será introduzido futuramente para entities e migrations.
 *
 * @see docs/adr/001-nestjs-proxy.md
 */
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
