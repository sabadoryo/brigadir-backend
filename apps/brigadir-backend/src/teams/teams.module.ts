import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TeamsService } from './teams.service';

@Module({
  providers: [TeamsService],
  exports: [TeamsService],
  imports: [PrismaModule],
})
export class TeamsModule {}
