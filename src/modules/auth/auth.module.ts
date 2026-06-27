import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { User } from '@domain/entities/User.entity';
import { UsersRepository } from '@infrastructure/repositories/users.repository';
import { TokenService } from '@infrastructure/services/token.service';
import { HashRepository } from '@infrastructure/repositories/hash.repository';
import { MailRepository } from '@infrastructure/repositories/mail.repository';
import { TokenCacheRepository } from '@infrastructure/repositories/token-cache.repository';
import { RedisProvider } from '@infrastructure/redis/redis.provider';
import { RabbitmqModule } from '@infrastructure/messaging/rabbitmq.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RabbitmqModule],
  providers: [
    AuthService,
    UsersRepository,
    TokenService,
    HashRepository,
    MailRepository,
    JwtService,
    RedisProvider,
    TokenCacheRepository,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
