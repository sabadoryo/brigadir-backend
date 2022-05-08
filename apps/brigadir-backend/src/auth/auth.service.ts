import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async findUserFromDiscordId(discordId: string): Promise<any> {
    const user = await this.usersService.findOne(discordId);
    console.log(user);
    if (!user) {
      console.log(discordId);
      throw new UnauthorizedException();
    }

    return user;
  }
}
