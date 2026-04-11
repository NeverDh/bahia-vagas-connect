import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/** Claims relevantes do JWT do Supabase GoTrue. */
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

/** Usuário anexado a `req.user` após validação do JWT. */
export interface JwtValidatedUser {
  userId: string;
  email?: string;
  role?: string;
  user_metadata: Record<string, unknown>;
}

/**
 * Valida JWT do Supabase com o segredo do projeto (HS256).
 *
 * Princípios (.agent/skills/api-patterns/auth.md): verificar assinatura e expiração;
 * claims mínimos no payload validado.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('SUPABASE_JWT_SECRET');
    if (!secret) {
      throw new Error(
        'SUPABASE_JWT_SECRET é obrigatória para validar JWTs do Supabase.',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  validate(payload: SupabaseJwtPayload): JwtValidatedUser {
    if (!payload?.sub) {
      throw new UnauthorizedException('Token inválido.');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      user_metadata: payload.user_metadata ?? {},
    };
  }
}
