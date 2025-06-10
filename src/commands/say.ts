import { SlashCommandBuilder } from "discord.js";

const sayCommand = new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send a message through the bot (Owner only)')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send')
        .setRequired(true))

export default sayCommand;
