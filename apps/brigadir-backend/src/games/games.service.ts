import { Injectable } from '@nestjs/common';
import { BotService } from '../bot/bot.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueuesService } from '../queues/queues.service';
import { TeamsService } from '../teams/teams.service';
import { UsersService } from '../users/users.service';
import { MessageActionRow, MessageSelectMenu } from 'discord.js';

@Injectable()
export class GamesService {
  players: any;
  teamA: any;
  teamB: any;
  algorithm = 'random';
  voiceA: any;
  voiceB: any;
  queue: any;
  clanwar: any;
  winnerTeam: any;
  loserTeam: any;

  constructor(
    private prisma: PrismaService,
    private queueService: QueuesService,
    private usersService: UsersService,
    private teamsService: TeamsService,
    private botService: BotService,
  ) {}

  async createGame(data) {
    this.algorithm = 'random';
    await this.setPlayers(data);
    await this.makeTeams();
    await this.createVoiceChannels();
    this.putTeamsToChannels();
    await this.createClanwar();
    await this.closeQueue();
    this.anounceClanwar();
    return this.clanwar;
  }

  async makeTeams() {
    this.balanceTeams();
    await this.createTeams();
  }

  balanceTeams() {
    switch (this.algorithm) {
      case 'random':
        this.players.sort((a, b) => {
          if (a.clanwar_profile[0].points < b.clanwar_profile[0].points) {
            return -1;
          }
          if (a.clanwar_profile[0].points > b.clanwar_profile[0].points) {
            return 1;
          }
          return 0;
        });

        const teamAIds = [0, 9, 2, 7, 5];
        const teamBIds = [1, 8, 3, 6, 4];
        this.teamA = this.players.filter((v, i) => teamAIds.includes(i));
        this.teamB = this.players.filter((v, i) => teamBIds.includes(i));
    }
  }

  async createTeams() {
    const teamAIds = this.teamA.map((value) => {
      return { member_id: value.id };
    });
    const teamBIds = this.teamB.map((value) => {
      return { member_id: value.id };
    });

    this.teamA = await this.teamsService.createTeam('teamA', teamAIds);
    this.teamB = await this.teamsService.createTeam('teamB', teamBIds);
  }

  async upsertUserClanWarProfile(userId, disciplineId) {
    return this.prisma.clanwar_profile.upsert({
      where: {
        user_id_discipline_id: {
          user_id: userId,
          discipline_id: disciplineId,
        },
      },
      create: {
        user_id: userId,
        discipline_id: disciplineId,
        points: 1000,
      },
      update: {},
    });
  }

  async setPlayers(data) {
    const queue = await this.queueService.getQueue(data.queue_id);
    this.queue = queue;

    const userIds = queue.QueueMember.map((m) => {
      this.upsertUserClanWarProfile(m.users.id, queue.discipline_id);
      return m.users.id;
    });

    this.players = await this.usersService.getUsersWithClanwarProfile(
      userIds,
      queue.discipline_id,
    );
  }

  async createVoiceChannels() {
    this.voiceA = await this.botService.createVoiceChannel(
      this.queue.guild_id,
      'teamA',
      this.queue.voice_channel_id,
    );

    this.voiceB = await this.botService.createVoiceChannel(
      this.queue.guild_id,
      'teamB',
      this.queue.voice_channel_id,
    );
  }

  putTeamsToChannels() {
    this.teamA.team_members.map((p) => {
      this.botService.changeChannelOfAPlayer(
        p.users.discord_id,
        this.queue.voice_channel_id,
        this.voiceA.id,
      );
    });

    this.teamB.team_members.map((p) => {
      this.botService.changeChannelOfAPlayer(
        p.users.discord_id,
        this.queue.voice_channel_id,
        this.voiceB.id,
      );
    });
  }

  async createClanwar() {
    this.clanwar = await this.prisma.clanwar.create({
      data: {
        name: this.queue.name,
        discipline: {
          connect: { id: this.queue.discipline_id },
        },
        team_clanwar_teamA_idToteam: {
          connect: { id: this.teamA.id },
        },
        team_clanwar_teamB_idToteam: {
          connect: { id: this.teamB.id },
        },
        start_time: new Date(),
        voiceA_id: this.voiceA.id,
        voiceB_id: this.voiceB.id,
        Queue: {
          connect: {
            id: this.queue.id,
          },
        },
      },
    });
  }

  async closeQueue() {
    await this.prisma.queue.update({
      where: {
        id: this.queue.id,
      },
      data: {
        is_opened: false,
      },
    });
  }

  anounceClanwar() {
    const message = `@everyone Clan War по ${this.queue.discipline.name} только что началась!\nСсылка: ${process.env.CLIENT_REDIRECT}/games/${this.clanwar.id}`;
    this.botService.sendMessageToChannel(this.queue.text_channel_id, message);
  }

  async getClanwar(clanwarId) {
    return this.prisma.clanwar.findFirst({
      where: {
        id: Number(clanwarId),
      },
      include: {
        team_clanwar_teamA_idToteam: {
          include: {
            team_members: {
              include: {
                users: true,
              },
            },
          },
        },
        team_clanwar_teamB_idToteam: {
          include: {
            team_members: {
              include: {
                users: true,
              },
            },
          },
        },
        discipline: true,
        Queue: {
          include: {
            users: true,
          },
        },
        team_clanwar_winner_idToteam: {
          include: {
            team_members: {
              include: {
                users: true,
              },
            },
          },
        },
      },
    });
  }

  async endGame(data, clanwarId) {
    this.clanwar = await this.getClanwar(clanwarId);
    await this.updatePoints(data.winner_id);
    await this.closeClanwar(data.winner_id);
    await this.transferPlayersToGroupUpVoiceChannel();
    this.startPogPoll();
    return this.getClanwar(this.clanwar.id);
  }
  async updatePoints(winnerId) {
    this.winnerTeam =
      Number(winnerId) === this.clanwar.team_clanwar_teamA_idToteam.id
        ? this.clanwar.team_clanwar_teamA_idToteam
        : this.clanwar.team_clanwar_teamB_idToteam;
    this.loserTeam =
      Number(winnerId) !== this.clanwar.team_clanwar_teamA_idToteam.id
        ? this.clanwar.team_clanwar_teamA_idToteam
        : this.clanwar.team_clanwar_teamB_idToteam;

    this.winnerTeam.team_members.map((m) => {
      this.updateUserClanwarProfilePoints(
        m.users.id,
        this.clanwar.discipline_id,
        'inc',
        25,
      );
    });

    this.loserTeam.team_members.map((m) => {
      this.updateUserClanwarProfilePoints(
        m.users.id,
        this.clanwar.discipline_id,
        'dec',
        25,
      );
    });
  }

  async updateUserClanwarProfilePoints(member_id, discipline_id, type, amount) {
    return this.prisma.clanwar_profile.update({
      where: {
        user_id_discipline_id: {
          user_id: member_id,
          discipline_id: discipline_id,
        },
      },
      data: {
        points: {
          increment: type === 'inc' ? amount : -amount,
        },
      },
      include: {
        users: true,
      },
    });
  }

  async closeClanwar(winnerId) {
    await this.prisma.clanwar.update({
      where: {
        id: this.clanwar.id,
      },
      data: {
        end_time: new Date(),
        team_clanwar_winner_idToteam: {
          connect: {
            id: Number(winnerId),
          },
        },
      },
    });
    this.clanwar = await this.getClanwar(this.clanwar.id);
  }

  async transferPlayersToGroupUpVoiceChannel() {
    this.botService.transferFromChannelToChannel(
      this.clanwar.voiceA_id,
      this.clanwar.Queue.voice_channel_id,
    );
    this.botService.transferFromChannelToChannel(
      this.clanwar.voiceB_id,
      this.clanwar.Queue.voice_channel_id,
    );
  }

  async startPogPoll() {
    const optionsA = this.clanwar.team_clanwar_teamA_idToteam.team_members.map(
      (member) => {
        return {
          label: member.users.name,
          value: member.users.id,
          description: '+15',
        };
      },
    );
    const optionsB = this.clanwar.team_clanwar_teamB_idToteam.team_members.map(
      (member) => {
        return {
          label: member.users.name,
          value: member.users.id,
          description: '+15',
        };
      },
    );

    const options = [...optionsA, ...optionsB];

    const select = this.selectMenu(this.clanwar.id, 'Выберите MVP', options);

    const mvpPollMessage = await this.botService.sendMessageToChannel(
      this.clanwar.Queue.text_channel_id,
      '@everyone Выберите MVP, голосование длится 30 секунд',
      select,
    );
    const pogId = await this.startMvpPollCollector(mvpPollMessage);

    const pog = await this.updateUserClanwarProfilePoints(
      Number(pogId),
      this.clanwar.discipline_id,
      'inc',
      15,
    );

    await this.setGamePog(this.clanwar.id, pog.id);

    mvpPollMessage.edit({
      content: `@everyone POG of **${this.clanwar.name}** is  <@${pog.users.discord_id}>:crown:`,
      components: [],
    });
  }

  selectMenu(customId, placeholder, options) {
    for (const opt of options) {
      const keys = Object.keys(opt);
      for (const key of keys) {
        opt[key] = opt[key].toString();
      }
    }

    return new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId(customId.toString())
        .setPlaceholder(placeholder)
        .addOptions(options),
    );
  }

  startMvpPollCollector(mvpPollMessage) {
    return new Promise((resolve, reject) => {
      const filter = (interaction) => {
        interaction.deferUpdate();
        return (
          interaction.isSelectMenu() && interaction.customId == this.clanwar.id
        );
      };
      const collector = mvpPollMessage.createMessageComponentCollector({
        filter,
        time: 30000,
      });

      collector.on('end', async (collected) => {
        const answerList = {};

        for (const [id, answer] of collected) {
          if (!answerList[answer.values[0]]) {
            answerList[answer.values[0]] = 1;
          } else {
            answerList[answer.values[0]]++;
          }
        }

        let max = 0;
        let pogId = null;
        for (const i in answerList) {
          if (answerList[i] > max) {
            max = answerList[i];
            pogId = i;
          }
        }
        resolve(pogId);
      });
    });
  }

  async setGamePog(clanwarId, pogId) {
    return this.prisma.clanwar.update({
      where: {
        id: clanwarId,
      },
      data: {
        pog_id: pogId,
      },
    });
  }
}
