import { SlashCommandBuilder } from "discord.js";

const groupStageStatusCommand = new SlashCommandBuilder()
  .setName('groupstage-status')
  .setDescription('Lista qué jugadores continúan después de la fase de grupos y quiénes no.');

export default groupStageStatusCommand;