import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdzunaImportService } from '../jobs/adzuna-import.service.js';
import { CronSecretGuard } from './guards/cron-secret.guard.js';

@ApiTags('Cron')
@Controller('api/cron')
export class CronController {
  constructor(private readonly adzunaImport: AdzunaImportService) {}

  @Post('jobs/import')
  @UseGuards(CronSecretGuard)
  @ApiOperation({
    summary:
      'Importar vagas Adzuna (agendador externo: Supabase pg_cron + X-Cron-Secret)',
  })
  @ApiHeader({ name: 'X-Cron-Secret', required: true })
  @ApiResponse({ status: 200 })
  importJobs() {
    return this.adzunaImport.importFromAdzuna();
  }
}
