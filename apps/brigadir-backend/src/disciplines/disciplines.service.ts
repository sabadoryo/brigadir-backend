import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DisciplinesService {
  constructor(private prisma: PrismaService) {}

  async getAllDisciplines() {
    const disciplines = await this.prisma.discipline.findMany({});

    return disciplines;
  }
}
