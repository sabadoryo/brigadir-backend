import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller()
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('/main-page')
  getMainPageStats(): any {
    const stats = this.statsService.getMainPageStats();
    return stats;
  }
}
