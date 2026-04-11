import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class AdminAnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'ISO 8601 — retorna registros com last_visit / started_at / viewed_at >= since',
  })
  @IsOptional()
  @IsISO8601()
  since?: string;
}
