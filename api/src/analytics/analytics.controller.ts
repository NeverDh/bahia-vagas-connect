import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AnalyticsService } from './analytics.service.js';
import { TrackVisitDto } from './dto/track-visit.dto.js';

@ApiTags('Analytics')
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Registrar page view (público)',
    description:
      'Substitui a Edge Function track-visit. IP é hasheado no servidor.',
  })
  @ApiBody({ type: TrackVisitDto })
  @ApiResponse({ status: 200, description: 'session_id e visitor_id' })
  async track(@Req() req: Request, @Body() dto: TrackVisitDto) {
    return this.analyticsService.track(req, dto);
  }
}
