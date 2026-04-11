import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCompanyProfileDto {
  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Nome é obrigatório.' })
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string | null;

  /** CNPJ com ou sem máscara; ignorado quando `is_freelancer` é true. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cnpj?: string | null;

  @ApiProperty()
  @IsBoolean()
  is_freelancer!: boolean;
}
