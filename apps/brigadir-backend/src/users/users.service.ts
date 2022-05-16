import { Injectable } from '@nestjs/common';
import { users } from '@prisma/client';
import { BotService } from '../bot/bot.service';
import { PrismaService } from '../prisma/prisma.service';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private bot: BotService) {}

  async findOne(discord_id: string) {
    return this.prisma.users.findFirst({
      where: {
        discord_id,
      },
    });
  }

  async getAll() {
    return this.prisma.users.findMany({});
  }

  async getWinner() {
    const clanwars = await this.prisma.clanwar.findMany({
      include: {
        team_clanwar_teamA_idToteam: {
          include: {
            team_members: {
              include: {
                users: true,
              },
            },
          },
        },
        team_clanwar_teamB_idToteam: {
          include: {
            team_members: {
              include: {
                users: true,
              },
            },
          },
        },
      },
      where: {
        discipline_id: 4,
      },
    });

    const playersList = clanwars.map((m) => {
      return [
        ...m.team_clanwar_teamA_idToteam.team_members.map(m => m.users),
        ...m.team_clanwar_teamB_idToteam.team_members.map(m => m.users),
      ];
    });

    const playersListFlattened = [
      ...new Map(
        playersList.flat().map((item) => [item['name'], item]),
      ).values(),
    ];

    const sponsordIds = [1, 3, 52, 94, 29, 78];
    const withoutSponsorsList = playersListFlattened.filter(p => {
      return !sponsordIds.includes(p.id);
    });

    const randomWinner =
      withoutSponsorsList[
        Math.floor(Math.random() * withoutSponsorsList.length)
      ];

    return randomWinner;
  }

  async getProbabilities() {
    const clanwars = await this.prisma.clanwar.findMany({
      include: {
        team_clanwar_teamA_idToteam: {
          include: {
            team_members: {
              include: {
                users: true,
              },
            },
          },
        },
        team_clanwar_teamB_idToteam: {
          include: {
            team_members: {
              include: {
                users: true,
              },
            },
          },
        },
      },
      where: {
        discipline_id: 4,
      },
    });

    const playersList = clanwars.map((m) => {
      return [
        ...m.team_clanwar_teamA_idToteam.team_members.map(m => m.users),
        ...m.team_clanwar_teamB_idToteam.team_members.map(m => m.users),
      ];
    });

    const playersListFlattened = [
      ...new Map(
        playersList.flat().map((item) => [item['name'], item]),
      ).values(),
    ];

    const sponsordIds = [1, 21, 69];
    const withoutSponsorsList = playersListFlattened.filter(p => {
      return !sponsordIds.includes(p.id);
    });

    const probabilities = {};

    for (const p of withoutSponsorsList) {
      if (probabilities[p.name]) {
        probabilities[p.name]++;
      } else {
        probabilities[p.name] = 1;
      }
    }

    const res = [];

    for (const [key, value] of Object.entries(probabilities)) {
      res.push({
        name: key,
        value: (Number(value) / withoutSponsorsList.length) * 100,
      });
    }
    return res;
  }

  async getUserWithQueues(discord_id) {
    return this.prisma.users.findFirst({
      where: {
        discord_id,
      },
      include: {
        QueueMember: {
          include: {
            Queue: true,
          },
        },
      },
    });
  }

  async updateIsReadyOnQueue(userId, queueMemberId, isReady) {
    return this.prisma.users.update({
      where: {
        id: userId,
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
      include: {
        QueueMember: {
          include: {
            Queue: {
              include: {
                QueueMember: {
                  include: {
                    users: true,
                  },
                },
                discipline: true,
                users: true,
              },
            },
          },
        },
      },
    });
  }

  async upsertUser(user) {
    return this.prisma.users.upsert({
      where: {
        discord_id: user.id,
      },
      create: {
        discord_id: user.id,
        name: user.username,
        discord_score: 1,
        avatar_hash: user.avatar,
      },
      update: {
        discord_id: user.id,
        name: user.username,
        avatar_hash: user.avatar,
      },
    });
  }

  async getUsersWithClanwarProfile(userIds, discipline_id) {
    return this.prisma.users.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      include: {
        clanwar_profile: {
          where: {
            discipline_id: discipline_id,
          },
        },
      },
    });
  }

  async getClanwarProfiles(userId) {
    return this.prisma.users.findFirst({
      where: {
        id: userId,
      },
      include: {
        clanwar_profile: {
          include: {
            discipline: true,
          },
        },
      },
    });
  }

  async fetchUserFromDiscord(discordId) {
    const user = this.bot.client.users.fetch(discordId);

    return user;
  }

  async updateClanwarProfilePoints(userId, disciplineId, points) {
    return this.prisma.clanwar_profile.update({
      where: {
        user_id_discipline_id: {
          user_id: Number(userId),
          discipline_id: Number(disciplineId),
        },
      },
      data: {
        points: Number(points),
      },
    });
  }

  async updateUserDiscordScore(userId, points, type) {
    return this.prisma.users.update({
      where: {
        id: Number(userId),
      },
      data: {
        discord_score: {
          increment: type === 'inc' ? points : -points,
        },
      },
    });
  }
}
