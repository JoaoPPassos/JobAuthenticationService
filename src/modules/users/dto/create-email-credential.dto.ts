import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateEmailCredentialDTO {
  @ApiProperty({
    example: 'joao@gmail.com',
    description: 'Email to be monitored',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'myEmailPassword123',
    description: 'IMAP/email authentication password',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
