import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { GamesModule } from './games/games.module';
import { CreateQueueMiddleware } from './queues/middlewares/createQueue.middleware';
import { PrismaModule } from './prisma/prisma.module';

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
          {
            path: 'users',
            module: UsersModule,
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
    GamesModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CreateQueueMiddleware)
      .forRoutes({ path: 'api/queues', method: RequestMethod.POST });
  }
}
