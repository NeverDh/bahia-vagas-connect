import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ValidateCnpjDto {
  @ApiProperty({
    description: 'CNPJ com ou sem máscara (apenas dígitos são considerados)',
    example: '11222333000181',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  cnpj!: string;
}
