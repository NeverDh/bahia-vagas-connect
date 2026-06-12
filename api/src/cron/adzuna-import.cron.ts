import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { AdzunaImportService } from '../jobs/adzuna-import.service.js';

@Injectable()
export class AdzunaImportCron {
  private readonly logger = new Logger(AdzunaImportCron.name);
  private running = false;

  constructor(
    private readonly adzunaImport: AdzunaImportService,
    private readonly config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async runHourlyImport(): Promise<void> {
    if (this.config.get<string>('ADZUNA_CRON_ENABLED') !== 'true') {
      return;
    }

    if (this.running) {
      this.logger.warn('Importação Adzuna anterior ainda em execução — pulando');
      return;
    }

    this.running = true;
    try {
      const result = await this.adzunaImport.importFromAdzuna();
      this.logger.log(`Cron Adzuna: ${result.message}`);
    } catch (e) {
      this.logger.error(
        'Cron Adzuna falhou',
        e instanceof Error ? e.message : e,
      );
    } finally {
      this.running = false;
    }
  }
}
