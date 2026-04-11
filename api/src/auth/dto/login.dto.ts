import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO para POST /api/auth/login.
 * Validação alinhada ao GoTrue/Supabase (senha mínima 6 caracteres).
 */
export class LoginDto {
  @ApiProperty({ example: 'usuario@exemplo.com', format: 'email' })
  @IsEmail({}, { message: 'Email inválido.' })
  @MaxLength(320, { message: 'Email excede o tamanho máximo permitido.' })
  email!: string;

  @ApiProperty({ example: 'senhaSegura1', minLength: 6, maxLength: 128 })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  @MaxLength(128, { message: 'Senha excede o tamanho máximo permitido.' })
  password!: string;
}
