import { SlashCommandBuilder } from "discord.js";

const sendMatchesCommand = new SlashCommandBuilder()
  .setName('send-matches')
  .setDescription('Manda los partidos activos')
  .addBooleanOption(option =>
        option.setName('revelar')
            .setDescription('⚠️​ ¿Revelar los resultados de todos?')
            .setRequired(true))
  .addStringOption(option =>
        option.setName('partido')
            .setDescription('Escoge un partido a filtrar (opcional)')
            .setRequired(false)
  );;

export default sendMatchesCommand;