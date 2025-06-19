import { SlashCommandBuilder } from "discord.js";

const dailySummaryCommand = new SlashCommandBuilder()
  .setName('daily-summary')
  .setDescription('Muestra un resumen del día actual o de una fecha específica')
  .addStringOption(option =>
    option.setName('fecha')
      .setDescription('Fecha en formato YYYY-MM-DD (opcional, por defecto hoy)')
      .setRequired(false)
  );

export default dailySummaryCommand;