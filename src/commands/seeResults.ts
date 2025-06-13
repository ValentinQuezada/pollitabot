import { SlashCommandBuilder } from "discord.js";

const seeResultsCommand = new SlashCommandBuilder()
  .setName('see-results')
  .setDescription('Muestra tus predicciones de partidos que aún no han finalizado');

export default seeResultsCommand;