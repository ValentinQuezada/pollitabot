import { SlashCommandBuilder } from "discord.js";

const anonymousMessageCommand = new SlashCommandBuilder()
    .setName('anon')
    .setDescription('Envía un mensaje secreto al owner')
    .addStringOption(option =>
    option.setName('message')
        .setDescription('Tu mensaje')
        .setRequired(true));

export default anonymousMessageCommand;