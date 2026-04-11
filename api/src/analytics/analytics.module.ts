import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AnalyticsPageView,
  AnalyticsSession,
  AnalyticsVisitor,
} from '../entities/analytics.entity.js';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsVisitor,
      AnalyticsSession,
      AnalyticsPageView,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
