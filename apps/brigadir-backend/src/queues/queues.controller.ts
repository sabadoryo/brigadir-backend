import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import joinQueueDto from './dto/joinQueue.dto';
import { QueuesService } from './queues.service';

@Controller()
export class QueuesController {
  constructor(private queueService: QueuesService) {}

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
  kickUserFromQueue(@Param('id') queueId: number, @Body() body): any {
    console.log(body, queueId);
    const queue = this.queueService.kickUserFromQueue(
      queueId,
      body.user_discord_id,
    );

    return queue;
  }
}
