import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Papel funcional no cadastro (espelha user_metadata.role do Supabase). */
export enum SignUpRole {
  CANDIDATE = 'candidate',
  COMPANY = 'company',
}

/**
 * DTO para POST /api/auth/signup.
 * Campos de perfil são opcionais e gravados em user_metadata.
 */
export class SignUpDto {
  @ApiProperty({ example: 'usuario@exemplo.com' })
  @IsEmail({}, { message: 'Email inválido.' })
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: 'senhaSegura1', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  @MaxLength(128)
  password!: string;

  @ApiProperty({ enum: SignUpRole, example: SignUpRole.CANDIDATE })
  @IsEnum(SignUpRole, { message: 'Role deve ser candidate ou company.' })
  role!: SignUpRole;

  @ApiPropertyOptional({ example: 'Maria Silva' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  full_name?: string;

  @ApiPropertyOptional({ example: '+5571999999999' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ example: 'Empresa XYZ' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Salvador, BA' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}
