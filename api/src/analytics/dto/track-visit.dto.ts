import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class TrackVisitDto {
  @ApiProperty({ example: '/vagas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  page_url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  page_title?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  session_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  referrer?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_admin?: boolean;
}
