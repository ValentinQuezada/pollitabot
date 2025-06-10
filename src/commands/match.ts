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
        .setRequired(true));
    
export default createMatchCommand;