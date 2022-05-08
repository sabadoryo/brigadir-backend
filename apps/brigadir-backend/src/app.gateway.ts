import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { QueuesService } from './queues/queues.service';
import { BotService } from './bot/bot.service';
import { queue } from 'rxjs';
import { GamesService } from './games/games.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private queueServce: QueuesService,
    private bot: BotService,
    private gamesService: GamesService,
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('QueueGateway');

  handleDisconnect(client: any) {
    const queueId = client.handshake.query.queueId;

    client.leave(queueId);
  }
  handleConnection(client: any, ...args: any[]) {
    const queueId = client.handshake.query.queueId;

    client.join(queueId);
  }

  afterInit(server: Server) {
    this.bot.client.on('voiceStateUpdate', async (oldState, newState) => {
      const channelId = newState.channelId;
      const userId = newState.id;
      const queues = await this.queueServce.findUserActiveQueues(userId);

      queues.map((q) => {
        if (q.voice_channel_id === channelId) {
          q.QueueMember.map((m) => {
            if (m.users.discord_id === userId) {
              this.queueServce
                .updateQueueMemberStatus(q.id, m.id, true)
                .then((res) => {
                  this.server.to(String(res.id)).emit('updateQueue', res);
                });
            }
          });
        } else {
          q.QueueMember.map((m) => {
            if (m.users.discord_id === userId) {
              this.queueServce
                .updateQueueMemberStatus(q.id, m.id, false)
                .then((res) => {
                  this.server.to(String(res.id)).emit('updateQueue', res);
                });
            }
          });
        }
      });
    });
  }

  @SubscribeMessage('updateQueue')
  async handleMessage(client: any, payload: any) {
    console.log(client, payload);
    const queue = await this.queueServce.getQueue(payload.queueId);
    this.server.to(String(queue.id)).emit('updateQueue', queue);
  }

  @SubscribeMessage('startClanwar')
  async handleStartClanwar(client: any, payload: any) {
    const clanwar = await this.gamesService.getClanwar(payload.clanwarId);
    this.server.to(String(payload.queueId)).emit('clanwarStarted', clanwar);
  }
}
