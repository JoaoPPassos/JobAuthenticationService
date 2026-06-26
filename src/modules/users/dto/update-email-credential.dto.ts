import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEmailCredentialDTO {
  @ApiProperty({ example: 'joao@gmail.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'newEmailPassword123', required: false })
  @IsString()
  @MinLength(1)
  @IsOptional()
  password?: string;
}
