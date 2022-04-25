import { Module } from '@nestjs/common';
import { BotModule } from '../bot/bot.module';
import { PrismaModule } from '../prisma/prisma.module';
import { QueuesController } from './queues.controller';
import { QueuesService } from './queues.service';

@Module({
  controllers: [QueuesController],
  providers: [QueuesService],
  imports: [PrismaModule, BotModule],
})
export class QueuesModule {}
