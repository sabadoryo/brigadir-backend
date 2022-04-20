import { Strategy } from 'passport-discord';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private http: HttpService,
  ) {
    super({
      clientID: configService.get('CLIENT_ID'),
      clientSecret: configService.get('CLIENT_SECRET'),
      callbackURL: configService.get('CLIENT_REDIRECT'),
      scope: ['identify', 'email', 'guilds'],
    });
  }

  async validate(accessToken: string): Promise<any> {
    console.log(accessToken + 'lol');
    const { data } = await firstValueFrom(
      this.http.get('https://discordapp.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );
    console.log(data);
    return data.id;
  }
}
