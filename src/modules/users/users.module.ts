import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { User } from '@domain/entities/User.entity';
import { EmailCredential } from '@domain/entities/EmailCredential.entity';
import { UsersRepository } from '@infrastructure/repositories/users.repository';
import { EmailCredentialRepository } from '@infrastructure/repositories/email-credential.repository';
import { AuthRepository } from '@infrastructure/repositories/auth.repository';
import { HashRepository } from '@infrastructure/repositories/hash.repository';
import { MailRepository } from '@infrastructure/repositories/mail.repository';
import { EncryptionService } from '@infrastructure/services/encryption.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { RabbitmqModule } from '@infrastructure/messaging/rabbitmq.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, EmailCredential]), RabbitmqModule],
  providers: [
    UsersService,
    UsersRepository,
    EmailCredentialRepository,
    AuthRepository,
    HashRepository,
    MailRepository,
    EncryptionService,
    JwtService,
    JwtAuthGuard,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
