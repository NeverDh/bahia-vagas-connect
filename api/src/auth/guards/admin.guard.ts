import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthService } from '../auth.service.js';
import type { JwtValidatedUser } from '../strategies/jwt.strategy.js';

/**
 * Exige sessão válida (use após JwtAuthGuard) e role `admin` em `user_roles`.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ user?: JwtValidatedUser }>();
    const userId = req.user?.userId;
    if (!userId) {
      throw new ForbiddenException('Acesso negado.');
    }
    const ok = await this.authService.isAdminUser(userId);
    if (!ok) {
      throw new ForbiddenException('Acesso negado.');
    }
    return true;
  }
}
