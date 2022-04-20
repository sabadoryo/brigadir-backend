import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DiscordStrategy } from './discord.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, DiscordStrategy],
  imports: [ConfigModule, UsersModule, PassportModule, HttpModule],
})
export class AuthModule {}
