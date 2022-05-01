import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CreateQueueMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const alreadyExsistingQueue = await this.prisma.queue.findFirst({
      where: {
        is_opened: true,
        name: req.body.name,
      },
    });

    if (alreadyExsistingQueue) {
      return res
        .status(HttpStatus.I_AM_A_TEAPOT)
        .json({ message: `CW ${req.body.name} already exists` });
    }

    next();
  }
}
