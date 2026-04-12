import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SupabaseService } from '../../config/supabase.service.js';
import type { JwtValidatedUser } from '../strategies/jwt.strategy.js';

/**
 * Valida o Bearer com `supabase.auth.getUser(token)` (service role).
 * Alinha com login/`getMe` e não depende de `SUPABASE_JWT_SECRET` coincidir com o painel.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtValidatedUser }>();

    const authHeader = request.headers.authorization;
    const token =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : '';

    if (!token) {
      throw new UnauthorizedException('Token de acesso ausente.');
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .auth.getUser(token);

    if (error || !data?.user) {
      throw new UnauthorizedException(
        error?.message ?? 'Token inválido ou expirado.',
      );
    }

    const u = data.user;
    request.user = {
      userId: u.id,
      email: u.email ?? undefined,
      role: u.role,
      user_metadata: (u.user_metadata ?? {}) as Record<string, unknown>,
    };

    return true;
  }
}
