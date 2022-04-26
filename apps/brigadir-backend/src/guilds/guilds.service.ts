import { Injectable } from '@nestjs/common';
import { BotService } from '../bot/bot.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuildsService {
  constructor(private botService: BotService, private prisma: PrismaService) {}

  async fetchAllUserxBotGuilds(userId) {
    const allGuilds = await this.botService.getAllGuilds();
    const userGuilds = [];

    for (const guild of allGuilds) {
      try {
        await guild[1].members.fetch(userId);
        userGuilds.push(guild[1]);
      } catch (err) {
        console.log(err);
      }
    }
    return userGuilds;
  }

  async fetchAllGuildQueues(guildId) {
    const queues = await this.prisma.queue.findMany({
      where: {
        guild_id: guildId,
        is_opened: true,
      },
      include: {
        discipline: true,
        QueueMember: {
          include: {
            users: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return queues;
  }

  async fetchAllChannels(guildId, type) {
    const guild = await this.botService.findGuildById(guildId);

    const channelType = type === 'voice' ? 'GUILD_VOICE' : 'GUILD_TEXT';

    const channels = await guild.channels.cache.filter(
      (c) => c.type === channelType,
    );

    return channels;
  }
}
