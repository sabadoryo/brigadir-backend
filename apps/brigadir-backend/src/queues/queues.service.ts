import { Injectable } from '@nestjs/common';
import { queue } from 'rxjs';
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
          orderBy: {
            joined_at: 'asc',
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

  async kickUserFromQueue(queueId, userDiscordId) {
    return await this.leaveQueue(userDiscordId, queueId);
  }

  async createQueue({
    name,
    host_discord_id,
    discipline_id,
    voice_channel_id,
    guild_id,
    text_channel_id,
  }) {
    const user = await this.prisma.users.findFirst({
      where: { discord_id: host_discord_id },
    });

    const queue = await this.prisma.queue.create({
      data: {
        name,
        discipline_id: Number(discipline_id),
        voice_channel_id,
        text_channel_id,
        guild_id,
        host_id: user.id,
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

    const queueInfo = this.getQueue(queue.id);

    return queueInfo;
  }

  async closeQueue(queueId) {
    const queue = await this.prisma.queue.update({
      where: {
        id: Number(queueId),
      },
      data: {
        is_opened: false,
      },
    });

    return queue;
  }

  async findUserActiveQueues(memberDiscordId) {
    return this.prisma.queue.findMany({
      where: {
        is_opened: true,
        QueueMember: {
          some: {
            users: {
              discord_id: memberDiscordId,
            },
          },
        },
      },
      include: {
        QueueMember: {
          include: {
            users: true,
          },
          orderBy: {
            joined_at: 'asc',
          },
        },
        discipline: true,
        users: true,
      },
    });
  }

  async updateQueueMemberStatus(queueId, queueMemberId, isReady) {
    const queue = await this.prisma.queue.update({
      where: {
        id: queueId,
      },
      data: {
        QueueMember: {
          update: {
            where: {
              id: queueMemberId,
            },
            data: {
              is_ready: isReady,
            },
          },
        },
      },
    });

    return this.getQueue(queue.id);
  }
}
