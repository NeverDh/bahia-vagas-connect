import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CnpjService } from './cnpj.service.js';
import { ValidateCnpjDto } from './dto/validate-cnpj.dto.js';

@ApiTags('Integrations')
@Controller('api/integrations')
export class IntegrationsController {
  constructor(private readonly cnpjService: CnpjService) {}

  @Post('validate-cnpj')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Validar CNPJ e opcionalmente buscar dados na Receita (BrasilAPI)',
    description:
      'Mesmo contrato da Edge Function `validate-cnpj`: resposta sempre JSON com `valid` e opcionalmente `company` ou `error`.',
  })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  async validateCnpj(@Body() dto: ValidateCnpjDto) {
    const clean = dto.cnpj.replace(/\D/g, '');
    return this.cnpjService.lookupReceita(clean);
  }
}
