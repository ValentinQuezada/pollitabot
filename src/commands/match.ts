import { SlashCommandBuilder } from "discord.js";

const createMatchCommand = new SlashCommandBuilder()
    .setName('create-match')
    .setDescription('Create a match to post results in a channel')
    .addStringOption(option =>
      option.setName('team1')
        .setDescription('Team 1 Name')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('team2')
        .setDescription('Team 2 Name')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('datetime')
        .setDescription('Match datetime (YYYY-MM-DD HH:MM)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('group')
        .setDescription('Group Phase Letter(A, B, C, etc.)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('matchtype')
        .setDescription('Type of match')
        .setRequired(true)
        .addChoices(
          { name: 'Group Regular', value: 'group-regular' },
          { name: 'Round of 16 Regular', value: 'round-of-16-regular' },
          { name: 'Round of 16 Extra', value: 'round-of-16-extra' },
          { name: 'Quarterfinal Regular', value: 'quarterfinal-regular' },
          { name: 'Quarterfinal Extra', value: 'quarterfinal-extra' },
          { name: 'Semifinal Regular', value: 'semifinal-regular' },
          { name: 'Semifinal Extra', value: 'semifinal-extra' },
          { name: 'Final Regular', value: 'final-regular' },
          { name: 'Final Extra', value: 'final-extra' }
        )
    );

export default createMatchCommand;