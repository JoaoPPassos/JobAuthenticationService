import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@modules/auth/auth.module';
import { RabbitmqModule } from '@infrastructure/messaging/rabbitmq.module';
import configuration from '@config/configuration';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...configuration }),
    RabbitmqModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
