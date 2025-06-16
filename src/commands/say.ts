import { SlashCommandBuilder } from "discord.js";

const sayCommand = new SlashCommandBuilder()
    .setName('say')
    .setDescription('Envía un mensaje a través del bot (sólo para el owner)')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Mensaje a enviar')
        .setRequired(true))

export default sayCommand;
