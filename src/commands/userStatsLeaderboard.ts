import { SlashCommandBuilder } from "discord.js";

const userStatsLeaderboardCommand = new SlashCommandBuilder()
  .setName('userstats-leaderboard')
  .setDescription('Muestra la tabla de posiciones de User Stats (total neto)');

export default userStatsLeaderboardCommand;