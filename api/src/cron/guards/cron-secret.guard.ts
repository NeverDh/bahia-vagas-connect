import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class CronSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.config.get<string>('CRON_SECRET')?.trim();
    if (!secret) {
      throw new UnauthorizedException('CRON_SECRET não configurado no servidor');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers['x-cron-secret'];
    const provided = Array.isArray(header) ? header[0] : header;

    if (!provided || provided !== secret) {
      throw new UnauthorizedException('X-Cron-Secret inválido');
    }

    return true;
  }
}
