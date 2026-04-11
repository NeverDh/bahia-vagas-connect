import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protege rotas exigindo Bearer JWT emitido pelo Supabase (HS256).
 *
 * @see JwtStrategy — validação com SUPABASE_JWT_SECRET
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('supabase-jwt') {}
