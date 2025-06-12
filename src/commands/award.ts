import { SlashCommandBuilder } from "discord.js";

const createAwardCommand = new SlashCommandBuilder()
    .setName('create-award')
    .setDescription('Create an award to post results in a channel')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Award Name')
        .setRequired(true)
    );

export default createAwardCommand;