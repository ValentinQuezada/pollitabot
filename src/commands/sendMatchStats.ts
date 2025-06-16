import { SlashCommandBuilder } from "discord.js";

const sendMatchStatsCommand = new SlashCommandBuilder()
  .setName('send-match-stats')
  .setDescription('Muestra estadísticas de apuestas pre-partido')
  .addStringOption(option =>
    option.setName('team1')
      .setDescription('Equipo A')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption(option =>
    option.setName('team2')
      .setDescription('Equipo B')
      .setRequired(true)
      .setAutocomplete(true)
  );

export default sendMatchStatsCommand;