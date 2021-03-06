import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Controller()
export class AuthController {
  constructor(
    private http: HttpService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  @Get('/')
  login(): any {
    return 'asd';
  }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async getUserFromDiscordLogin(@Req() req) {
    console.log(req.data);
    console.log('kek');
    return req.user;
  }

  @Post('check')
  check(@Body() data: any) {
    this.usersService.upsertUser(data);
  }

  // @Get('discord/get-token')
  // async test(@Query('code') code) {
  //   if (code) {
  //     const api_endpoint = 'https://discord.com/api/v8/oauth2/token';
  //     const request = this.http
  //       .post(
  //         api_endpoint,
  //         {
  //           client_id: this.configService.get('CLIENT_ID'),
  //           client_secret: this.configService.get('CLIENT_SECRET'),
  //           grant_type: 'authorization_code',
  //           code: code,
  //           redirect_uri: this.configService.get('CLIENT_REDIRECT'),
  //         },
  //         {
  //           headers: {
  //             'Content-Type': 'application/x-www-form-urlencoded',
  //           },
  //         },
  //       )
  //       .subscribe((data) => {
  //         console.log(data);
  //       });
  //       console.log(request);
  //   }
  // }
}
