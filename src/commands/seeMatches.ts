import { SlashCommandBuilder } from "discord.js";

const seeMatchesCommand = new SlashCommandBuilder()
  .setName('see-matches')
  .setDescription('Muestra los partidos activos');

export default seeMatchesCommand;