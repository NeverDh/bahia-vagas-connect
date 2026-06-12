import { Module } from '@nestjs/common';
import { JobsModule } from '../jobs/jobs.module.js';
import { AdzunaImportCron } from './adzuna-import.cron.js';
import { CronController } from './cron.controller.js';
import { CronSecretGuard } from './guards/cron-secret.guard.js';

@Module({
  imports: [JobsModule],
  controllers: [CronController],
  providers: [AdzunaImportCron, CronSecretGuard],
})
export class CronModule {}
