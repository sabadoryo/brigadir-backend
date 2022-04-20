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
}
