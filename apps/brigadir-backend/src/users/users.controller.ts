import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import UpdateClanwarProfilePoints from './dto/updateClanwarProfilePoints.dto';
import { UsersService } from './users.service';
import { Response } from 'express';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    const users = await this.usersService.getAll();

    return users;
  }

  @Get('get-winner')
  async getRandomWinner() {
    const winner = await this.usersService.getWinner();

    return winner;
  }

  @Get('get-probabilities')
  async getProbabilities() {
    const probabilities = await this.usersService.getProbabilities();

    return probabilities;
  }

  @Get(':discord_id/clanwar-profiles')
  async getClanwarProfiles(@Param('discord_id') discordId: string) {
    const user = await this.usersService.findOne(discordId);

    if (user) {
      const profiles = await this.usersService.getClanwarProfiles(user.id);
      return profiles;
    } else {
      return [];
    }
  }

  @Get(':discord_id/info')
  async getUserInfo(@Param('discord_id') discordId: string) {
    const isExist = await this.usersService.findOne(discordId);
    if (!isExist) {
      return { message: 'User not found', success: false };
    }

    const user = await this.usersService.fetchUserFromDiscord(discordId);
    return {
      message: 'User Found',
      success: true,
      data: user,
    };
  }

  @Post(':discord_id/update-points')
  async updateClanwarProfilePoints(
    @Body() data: UpdateClanwarProfilePoints,
    @Res() response: Response,
    @Param('discord_id') discordId: string,
  ) {
    const user = await this.usersService.findOne(discordId);

    if (user.discord_score > 500) {
      await this.usersService.updateClanwarProfilePoints(
        user.id,
        data.discipline_id,
        data.points,
      );
      await this.usersService.updateUserDiscordScore(user.id, 500, 'dec');
      return response.status(HttpStatus.OK).json({
        message: 'User profile points updated',
        success: true,
      });
    } else {
      return response.status(HttpStatus.I_AM_A_TEAPOT).json({
        message: 'Not enough balance',
        success: false,
      });
    }
  }
}
