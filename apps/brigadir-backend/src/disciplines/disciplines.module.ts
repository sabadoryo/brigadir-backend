import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DisciplinesController } from './disciplines.controller';
import { DisciplinesService } from './disciplines.service';

@Module({
  controllers: [DisciplinesController],
  providers: [DisciplinesService],
  imports: [PrismaModule],
})
export class DisciplinesModule {}
