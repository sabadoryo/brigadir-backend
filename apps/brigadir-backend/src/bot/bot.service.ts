import { Injectable } from '@nestjs/common';
import { Client, Intents } from 'discord.js';

@Injectable()
export class BotService {
  client = null;

  constructor() {
    this.client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MEMBERS,
      ],
    });
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

  async sendMessageToChannel(channelId, message, components = null) {
    const channel = await this.client.channels.fetch(channelId);
    let msg = null;
    if (components) {
      msg = channel.send({
        components: [components],
        content: message,
      });
    } else {
      msg = channel.send(message);
    }

    return msg;
  }

  async createVoiceChannel(guildId, name, groupChannelId) {
    const groupUpChannel = await this.client.channels.fetch(groupChannelId);
    const parentOfGroupUpChannel = await this.client.channels.fetch(
      groupUpChannel.parentId,
    );

    const guild = await this.client.guilds.fetch(guildId);

    const voiceChannel = await guild.channels.create(name, {
      type: 'GUILD_VOICE',
      parent: parentOfGroupUpChannel,
    });

    return voiceChannel;
  }

  async changeChannelOfAPlayer(playerDiscordId, fromChannelId, toChannelId) {
    const fromChannel = await this.getChannel(fromChannelId);

    console.log(fromChannel.members);

    if (fromChannel.members.get(playerDiscordId)) {
      fromChannel.members.get(playerDiscordId).voice.setChannel(toChannelId);
    } else {
      console.log(`${playerDiscordId} is not found in channel`);
    }
  }

  async transferFromChannelToChannel(fromChannelId, toChannelId) {
    const fromChannel = await this.client.channels.fetch(fromChannelId);

    for (const [memberId, member] of fromChannel.members) {
      member.voice.setChannel(toChannelId);
    }

    setTimeout(() => {
      fromChannel.delete();
    }, 20000);
  }
}
