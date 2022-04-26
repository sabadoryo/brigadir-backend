import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { StatsModule } from './stats/stats.module';
import { UsersModule } from './users/users.module';
import { GuildsModule } from './guilds/guilds.module';
import { BotModule } from './bot/bot.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { QueuesModule } from './queues/queues.module';
import { DisciplinesModule } from './disciplines/disciplines.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    RouterModule.register([
      {
        path: 'api',
        children: [
          {
            path: 'auth',
            module: AuthModule,
          },
          {
            path: 'stats',
            module: StatsModule,
          },
          {
            path: 'guilds',
            module: GuildsModule,
          },
          {
            path: 'queues',
            module: QueuesModule,
          },
          {
            path: 'disciplines',
            module: DisciplinesModule,
          },
        ],
      },
    ]),
    AuthModule,
    UsersModule,
    StatsModule,
    GuildsModule,
    BotModule,
    QueuesModule,
    DisciplinesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
