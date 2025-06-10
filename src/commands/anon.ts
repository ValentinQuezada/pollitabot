import { SlashCommandBuilder } from "discord.js";

const anonymousMessageCommand = new SlashCommandBuilder()
    .setName('anon')
    .setDescription('Send a secret message to the owner')
    .addStringOption(option =>
    option.setName('message')
        .setDescription('Your secret message')
        .setRequired(true));

export default anonymousMessageCommand;