import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Query params para listagem pública de vagas (substitui filtros Supabase em `Jobs.tsx` e páginas SEO).
 */
export class QueryJobsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  /** Texto livre → função SQL `search_jobs` (unaccent, multi-palavra). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  remote_only?: boolean;

  /** Valores `contract_type` separados por vírgula (ex: `clt,pj`). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contract_types?: string;

  /** Valores `experience_level` separados por vírgula. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  experience_levels?: string;

  /** Filtro `location ILIKE %value%`. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ enum: ['newest', 'oldest'] })
  @IsOptional()
  @IsIn(['newest', 'oldest'])
  sort?: 'newest' | 'oldest' = 'newest';

  /**
   * Palavras para `(title ILIKE %w1% OR title ILIKE %w2% …)` — usado em `JobsByCategory` / SEO programático.
   */
  @ApiPropertyOptional({ description: 'Separadas por vírgula' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  title_keywords?: string;
}
