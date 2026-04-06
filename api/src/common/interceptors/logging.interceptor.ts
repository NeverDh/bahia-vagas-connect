/**
 * LoggingInterceptor — Interceptor global de logging.
 *
 * Registra cada requisição HTTP com:
 * - Método e URL
 * - Tempo de resposta (ms)
 * - Status code
 *
 * Útil para debugging e monitoramento de performance.
 * Em produção, considerar integrar com serviço de observabilidade.
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  /**
   * Intercepta cada request e mede o tempo de resposta.
   *
   * Log format: "GET /api/jobs 200 +45ms"
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const elapsed = Date.now() - now;
        this.logger.log(`${method} ${url} ${response.statusCode} +${elapsed}ms`);
      }),
    );
  }
}
