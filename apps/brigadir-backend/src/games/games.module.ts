import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueuesModule } from '../queues/queues.module';
import { UsersModule } from '../users/users.module';
import { TeamsModule } from '../teams/teams.module';
import { BotModule } from '../bot/bot.module';

@Module({
  providers: [GamesService],
  controllers: [GamesController],
  imports: [QueuesModule, UsersModule, PrismaModule, TeamsModule, BotModule],
  exports: [GamesService],
})
export class GamesModule {}
