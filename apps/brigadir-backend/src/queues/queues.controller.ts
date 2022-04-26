import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import createQueue from './dto/createQueue.dto';
import joinQueueDto from './dto/joinQueue.dto';
import { QueuesService } from './queues.service';

@Controller()
export class QueuesController {
  constructor(private queueService: QueuesService, private prisma: PrismaService) {}

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
    const alreadyExsistingQueue = await this.prisma.queue.findFirst({
      where: {
        is_opened: true,
        name: data.name,
      },
    });

    if (alreadyExsistingQueue) {
      return response
        .status(HttpStatus.I_AM_A_TEAPOT)
        .json({ message: `CW ${data.name} already exists` });
    }

    const queue = await this.queueService.createQueue(data);

    return response.status(HttpStatus.CREATED).json(queue);
  }

  @Post(':id/close')
  closeQueue(@Param('id') queueId): any {
    const queue = this.queueService.closeQueue(queueId);

    return queue;
  }
}
