import { SlashCommandBuilder } from "discord.js";

const seeMissingCommand = new SlashCommandBuilder()
  .setName('see-missing')
  .setDescription('Muestra los partidos pendientes en los que aún no has enviado predicción');

export default seeMissingCommand;