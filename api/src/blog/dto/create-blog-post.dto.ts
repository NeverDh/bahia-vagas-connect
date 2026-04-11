import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBlogPostDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  slug!: string;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  featured_image?: string | null;

  @ApiPropertyOptional({ default: 'Equipe BahiaVagas' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meta_title?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meta_description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  og_title?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  og_description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  og_image?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  canonical_url?: string | null;

  @ApiPropertyOptional({ default: 'draft' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  published_at?: string | null;
}
