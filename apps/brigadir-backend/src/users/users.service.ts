import { Injectable } from '@nestjs/common';
import { users } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(discord_id: string): Promise<users | undefined> {
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
    });

    const playersList = clanwars.map((m) => {
      return [
        ...m.team_clanwar_teamA_idToteam.team_members.map(m => m.users),
        ...m.team_clanwar_teamB_idToteam.team_members.map(m => m.users),
      ];
    });

    const playersListFlattened = playersList.flat();

    const sponsordIds = [1, 21, 69];
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
    });

    const playersList = clanwars.map((m) => {
      return [
        ...m.team_clanwar_teamA_idToteam.team_members.map(m => m.users),
        ...m.team_clanwar_teamB_idToteam.team_members.map(m => m.users),
      ];
    });

    const playersListFlattened = playersList.flat();

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
}
