/**
 * HttpExceptionFilter — Filtro global de exceções HTTP.
 *
 * Garante que TODAS as respostas de erro seguem o mesmo formato:
 * {
 *   statusCode: number,
 *   message: string | string[],
 *   error: string,
 *   timestamp: string,
 *   path: string
 * }
 *
 * SEGURANÇA: Nunca expõe stack traces ou detalhes internos ao cliente.
 * Logs internos com detalhes completos são feitos pelo LoggingInterceptor.
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/** Formato padronizado de resposta de erro da API */
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Intercepta qualquer exceção e formata a resposta.
   *
   * - HttpException: usa statusCode e mensagem da exceção
   * - Outros erros: retorna 500 com mensagem genérica (segurança)
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string | string[]) ?? exception.message;
        error = (resp.error as string) ?? 'Error';
      } else {
        message = exception.message;
        error = 'Error';
      }
    } else {
      // Erro inesperado — NÃO expor detalhes ao cliente
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Erro interno do servidor. Tente novamente.';
      error = 'Internal Server Error';

      // Log interno com detalhes para debug
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
