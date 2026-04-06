/**
 * HealthController — Endpoint de verificação de status do servidor.
 *
 * Usado por load balancers, monitoring, e verificação manual.
 * Retorna status "ok" e timestamp se o servidor está funcionando.
 */
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('api')
export class HealthController {
  /**
   * Health check do servidor.
   *
   * @returns Objeto com status "ok" e timestamp atual
   *
   * @example
   * GET /api/health
   * Response: { "status": "ok", "timestamp": "2026-04-06T01:00:00.000Z" }
   */
  @Get('health')
  @ApiOperation({ summary: 'Verificação de saúde do servidor' })
  @ApiResponse({
    status: 200,
    description: 'Servidor está funcionando',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-04-06T01:00:00.000Z' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
