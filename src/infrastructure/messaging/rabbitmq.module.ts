import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { EmailPublisher } from './email.publisher';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      uri: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
      exchanges: [],
    }),
  ],
  exports: [RabbitMQModule, EmailPublisher],
  providers: [EmailPublisher],
})
export class RabbitmqModule {}
