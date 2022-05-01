import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { BotService } from '../bot/bot.service';
import createQueue from './dto/createQueue.dto';
import joinQueueDto from './dto/joinQueue.dto';
import { QueuesService } from './queues.service';

@Controller()
export class QueuesController {
  constructor(
    private queueService: QueuesService,
    private botService: BotService,
  ) {}

  @Get(':id')
  getQueue(@Param('id') queueId: number): any {
    const queue = this.queueService.getQueue(queueId);

    return queue;
  }

  @Post(':id/join')
  joinQueue(@Param('id') queueId: number, @Body() body: joinQueueDto): any {
    const queue = this.queueService.joinQueue(body.user_discord_id, queueId);

    return queue;
  }

  @Post(':id/leave')
  leaveQueue(@Param('id') queueId: number, @Body() body: joinQueueDto): any {
    const queue = this.queueService.leaveQueue(body.user_discord_id, queueId);

    return queue;
  }

  @Post(':id/kick')
  kickUserFromQueue(
    @Param('id') queueId: number,
    @Body() body: joinQueueDto,
  ): any {
    console.log(body, queueId);
    const queue = this.queueService.kickUserFromQueue(
      queueId,
      body.user_discord_id,
    );

    return queue;
  }

  @Post()
  async createQueue(@Body() data: createQueue, @Res() response: Response) {
    const queue = await this.queueService.createQueue(data);

    if (data.text_channel_id) {
      const message = `@everyone очередь на **${queue.name}** открыта!\nСсылка:${process.env.CLIENT_REDIRECT}/clanwars/guilds/${queue.guild_id}/queues/${queue.id}`;
      this.botService.sendMessageToChannel(data.text_channel_id, message);
    }

    return response.status(HttpStatus.CREATED).json(queue);
  }

  @Post(':id/close')
  closeQueue(@Param('id') queueId): any {
    const queue = this.queueService.closeQueue(queueId);

    return queue;
  }
}
