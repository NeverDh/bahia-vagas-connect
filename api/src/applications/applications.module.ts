import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Application } from '../entities/application.entity.js';
import { CandidateProfile } from '../entities/candidate-profile.entity.js';
import { Job } from '../entities/job.entity.js';
import { ApplicationsController } from './applications.controller.js';
import { ApplicationsService } from './applications.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, Job, CandidateProfile]),
    AuthModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
