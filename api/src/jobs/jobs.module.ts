import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Job } from '../entities/job.entity.js';
import { Company } from '../entities/company.entity.js';
import { Application } from '../entities/application.entity.js';
import { CandidateProfile } from '../entities/candidate-profile.entity.js';
import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';
import { JsearchImportService } from './jsearch-import.service.js';
import { AdzunaImportService } from './adzuna-import.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Company, Application, CandidateProfile]),
    AuthModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, JsearchImportService, AdzunaImportService],
  exports: [JobsService, JsearchImportService, AdzunaImportService],
})
export class JobsModule {}
