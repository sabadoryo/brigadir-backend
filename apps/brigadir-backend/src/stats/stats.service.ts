import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getMainPageStats() {
    const usersCount = await this.prisma.users.count();
    const clanWarsCount = await this.prisma.clanwar.count();
    const maxPlayedDiscipline = await this.getMaxPlayedDiscipline();
    const overallSpentHours = await this.getOverallSpentTimeOnCW();
    const maxPogLooter = await this.getMaxPogLooter();

    return {
      usersCount,
      clanWarsCount,
      maxPlayedDiscipline,
      overallSpentHours,
      maxPogLooter,
    };
  }

  async getMaxPlayedDiscipline() {
    const groups = await this.prisma.clanwar.groupBy({
      by: ['discipline_id'],
      _count: {
        id: true,
      },
    });

    const maxPlayedDisciplineId = groups.reduce((prev, current) => {
      return prev._count.id > current._count.id ? prev : current;
    }).discipline_id;

    return await this.prisma.discipline.findFirst({
      where: {
        id: maxPlayedDisciplineId,
      },
    });
  }

  async getOverallSpentTimeOnCW() {
    const clanwars = await this.prisma.clanwar.findMany({});

    const total = clanwars.reduce((acc, c) => {
      if (c.end_time) {
        const diffTime = Math.abs(
          c.end_time.valueOf() - c.start_time.valueOf(),
        );
        return acc + diffTime;
      } else {
        return acc + 0;
      }
    }, 0);

    return Math.ceil(total / 1000 / 60 / 60);
  }

  async getMaxPogLooter() {
    const clanwars = await this.prisma.clanwar.groupBy({
      by: ['pog_id'],
      _count: {
        pog_id: true,
      },
    });

    const maxPoggerId = clanwars.reduce((prev, current) => {
      return prev._count.pog_id > current._count.pog_id ? prev : current;
    }).pog_id;

    return await this.prisma.users.findFirst({
      where: {
        id: maxPoggerId,
      },
    });
  }
}
