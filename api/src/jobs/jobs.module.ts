import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Job } from '../entities/job.entity.js';
import { Application } from '../entities/application.entity.js';
import { CandidateProfile } from '../entities/candidate-profile.entity.js';
import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Application, CandidateProfile]),
    AuthModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
