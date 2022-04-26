import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { GuildsService } from './guilds.service';

@Controller()
export class GuildsController {
  constructor(private guildsService: GuildsService) {}

  @Get('all/:user_id')
  allUserGuilds(@Param('user_id') userId): any {
    const guilds = this.guildsService.fetchAllUserxBotGuilds(userId);
    return guilds;
  }

  @Get(':guild_id/queues')
  getGuildQueues(@Param('guild_id') guildId): any {
    const queues = this.guildsService.fetchAllGuildQueues(guildId);

    return queues;
  }

  @Get(':guild_id/channels')
  getGuildChannels(
    @Query('type') type: string,
    @Param('guild_id') guildId: string,
  ): any {
    const channels = this.guildsService.fetchAllChannels(guildId, type);

    return channels;
  }
}
