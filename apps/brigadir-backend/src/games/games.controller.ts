import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller()
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Post()
  createGame(@Body() data: any) {
    const clanwar = this.gamesService.createGame(data);

    return clanwar;
  }

  @Get(':id')
  getClanwar(@Param('id') id: any) {
    const clanwar = this.gamesService.getClanwar(id);

    return clanwar;
  }

  @Post(':id/end')
  endClanwar(@Param('id') id: any, @Body() data: any) {
    const clanwar = this.gamesService.endGame(data, id);

    return clanwar;
  }
}
