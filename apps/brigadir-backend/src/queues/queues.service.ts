import { Injectable } from '@nestjs/common';
import { BotService } from '../bot/bot.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QueuesService {
  constructor(private prisma: PrismaService, private bot: BotService) {}

  async getQueue(queueId) {
    const queue = await this.prisma.queue.findFirst({
      where: {
        id: Number(queueId),
      },
      include: {
        QueueMember: {
          include: {
            users: true,
          },
        },
        discipline: true,
        users: true,
      },
    });

    queue['channel'] = await this.bot.getChannel(queue.voice_channel_id);

    return queue;
  }

  async joinQueue(userDiscrdId: string, queueId: number) {
    const user = await this.prisma.users.findFirst({
      where: {
        discord_id: userDiscrdId,
      },
    });

    const queue = await this.prisma.queue.update({
      where: {
        id: Number(queueId),
      },
      data: {
        QueueMember: {
          create: {
            users: {
              connect: {
                id: user.id,
              },
            },
          },
        },
      },
    });
    return await this.getQueue(queue.id);
  }

  async leaveQueue(userDiscordId: string, queueId: number) {
    const user = await this.prisma.users.findFirst({
      where: { discord_id: userDiscordId },
    });

    const queue = await this.prisma.queue.update({
      where: {
        id: Number(queueId),
      },
      data: {
        QueueMember: {
          deleteMany: {
            member_id: user.id,
          },
        },
      },
    });

    return await this.getQueue(queue.id);
  }
}
