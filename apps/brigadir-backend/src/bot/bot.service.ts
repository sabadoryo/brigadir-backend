import { Injectable } from '@nestjs/common';
import { Client, Intents } from 'discord.js';

@Injectable()
export class BotService {
  client = null;

  constructor() {
    this.client = new Client({ intents: [Intents.FLAGS.GUILDS] });
    this.client.login(process.env.BOT_TOKEN);

    this.client.once('ready', () => {
      console.log('Bot is online!');
    });
  }

  async getAllGuilds() {
    const guilds = await this.client.guilds.cache;

    return guilds;
  }

  async getChannel(channelId) {
    const channel = await this.client.channels.fetch(channelId);

    return channel;
  }

  async findGuildById(guildId) {
    const guild = await this.client.guilds.fetch(guildId);

    return guild;
  }

  async sendMessageToChannel(channelId, message) {
    const channel = await this.client.channels.fetch(channelId);

    channel.send(message);

    return true;
  }
}
