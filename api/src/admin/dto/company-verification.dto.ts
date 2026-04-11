import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CompanyVerificationDto {
  @ApiProperty()
  @IsBoolean()
  is_verified!: boolean;
}
