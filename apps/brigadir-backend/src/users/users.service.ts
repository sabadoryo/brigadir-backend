import { Injectable } from '@nestjs/common';
import { users } from '@prisma/client';
import { stat } from 'fs';
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

    const sponsordIds = [1, 3];
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

  async getTeammatesStats(discordId) {
    const userTeams = await this.prisma.team.findMany({
      where: {
        team_members: {
          some: {
            users: {
              discord_id: discordId,
            },
          },
        },
      },
      include: {
        team_members: {
          include: {
            users: true,
          },
        },
        clanwar_clanwar_winner_idToteam: true,
      },
    });

    const loserTeams = userTeams
      .filter((t) => t.clanwar_clanwar_winner_idToteam === null)
      .map((lt) => lt.team_members);

    const winnerTeams = userTeams
      .filter((t) => t.clanwar_clanwar_winner_idToteam !== null)
      .map((wt) => wt.team_members);

    const stats = {};

    userTeams.map((t) => {
      t.team_members.map((tm) => {
        if (tm.users.discord_id === discordId) return;

        stats[tm.member_id] = {
          loses: 0,
          wins: 0,
          ...tm.users,
        };

        loserTeams.map((lt) => {
          lt.map((t) => {
            if (t.member_id === tm.member_id) {
              stats[tm.member_id].loses += 1;
            }
          });
        });

        winnerTeams.map((wt) => {
          wt.map((t) => {
            if (tm.member_id === t.member_id) {
              stats[tm.member_id].wins += 1;
            }
          });
        });
      });
    });

    return this.statsObjectToArray(stats);
  }

  async getClanwarStats(discrdId) {
    const clanwars = await this.prisma.clanwar.findMany({
      where: {
        OR: [
          {
            team_clanwar_teamA_idToteam: {
              team_members: {
                some: {
                  users: {
                    discord_id: discrdId,
                  },
                },
              },
            },
          },
          {
            team_clanwar_teamB_idToteam: {
              team_members: {
                some: {
                  users: {
                    discord_id: discrdId,
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        team_clanwar_winner_idToteam: {
          include: {
            team_members: {
              include: {
                users: true,
              },
            },
          },
        },
        discipline: true,
      },
    });

    const result = {};

    clanwars.map((clanwar) => {
      if (!result[clanwar.discipline.name]) {
        result[clanwar.discipline.name] = {
          loses: 0,
          wins: 0,
          unfinished: 0,
          ...clanwar.discipline,
        };
      }

      if (!clanwar.winner_id) {
        result[clanwar.discipline.name].unfinished += 1;
      } else {
        const winnerUsersDiscordId =
          clanwar.team_clanwar_winner_idToteam.team_members.map(
            (m) => m.users.discord_id,
          );

        if (winnerUsersDiscordId.includes(discrdId)) {
          result[clanwar.discipline.name].wins += 1;
        } else {
          result[clanwar.discipline.name].loses += 1;
        }
      }
    });

    return this.statsObjectToArray(result);
  }

  async getPogStats(discordId) {
    const clanwars = await this.prisma.clanwar.findMany({
      where: {
        users: {
          discord_id: discordId,
        },
      },
      include: {
        discipline: true,
      },
    });

    const result = {};

    clanwars.map((c) => {
      if (!result[c.discipline.name]) {
        result[c.discipline.name] = {
          pog_times: 1,
          ...c.discipline,
        };
      } else {
        result[c.discipline.name].pog_times += 1;
      }
    });

    return this.statsObjectToArray(result);
  }

  statsObjectToArray(statsObject) {
    const res = [];

    for (const property in statsObject) {
      res.push(statsObject[property]);
    }

    return res;
  }
}
