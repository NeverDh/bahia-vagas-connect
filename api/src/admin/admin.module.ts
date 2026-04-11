import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { Company } from '../entities/company.entity.js';
import { Job } from '../entities/job.entity.js';
import { Application } from '../entities/application.entity.js';
import { CandidateProfile } from '../entities/candidate-profile.entity.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { AnalyticsModule } from '../analytics/analytics.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      Job,
      Application,
      CandidateProfile,
    ]),
    AuthModule,
    JobsModule,
    AnalyticsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
