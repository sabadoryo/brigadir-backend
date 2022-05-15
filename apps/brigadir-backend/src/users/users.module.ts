import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BotModule } from '../bot/bot.module';

@Module({
  providers: [UsersService],
  exports: [UsersService],
  imports: [PrismaModule, BotModule],
  controllers: [UsersController],
})
export class UsersModule {}
