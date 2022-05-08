import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async createTeam(name, memberIds) {
    return this.prisma.team.create({
      data: {
        name: name,
        team_members: {
          create: memberIds,
        },
      },
      include: {
        team_members: {
          include: {
            users: true,
          },
        },
      },
    });
  }
}
