import { Module } from '@nestjs/common';
import { QueuesModule } from '../queues/queues.module';
import { SocketService } from './socket.service';

@Module({
  providers: [SocketService],
  exports: [SocketService],
})
export class SocketModule {}
