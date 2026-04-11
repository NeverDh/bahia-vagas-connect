import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CnpjService } from './cnpj.service.js';
import { IntegrationsController } from './integrations.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [IntegrationsController],
  providers: [CnpjService],
})
export class IntegrationsModule {}
