import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import {
  ContractType,
  ExperienceLevel,
  JobStatus,
} from '../../entities/job.entity.js';

export class CreateCompanyJobDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requirements?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  benefits?: string | null;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  location!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  category!: string;

  @ApiProperty({ enum: ContractType })
  @IsEnum(ContractType)
  contract_type!: ContractType;

  @ApiProperty({ enum: ExperienceLevel })
  @IsEnum(ExperienceLevel)
  experience_level!: ExperienceLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  salary_min?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  salary_max?: number | null;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  remote_option?: boolean;

  @ApiPropertyOptional({ enum: JobStatus, default: JobStatus.ACTIVE })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}
