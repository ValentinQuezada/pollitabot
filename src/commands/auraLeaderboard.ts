import { SlashCommandBuilder } from "discord.js";

const auraLeaderboardCommand = new SlashCommandBuilder()
  .setName('aura-leaderboard')
  .setDescription('Muestra la tabla de posiciones de Aura Points');

export default auraLeaderboardCommand;