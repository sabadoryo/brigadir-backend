import { Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

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
}
