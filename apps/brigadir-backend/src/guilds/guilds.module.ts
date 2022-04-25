import { Module } from '@nestjs/common';
import { BotModule } from '../bot/bot.module';
import { BotService } from '../bot/bot.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';

@Module({
  controllers: [GuildsController],
  providers: [GuildsService],
  imports: [BotModule, PrismaModule],
})
export class GuildsModule {}
