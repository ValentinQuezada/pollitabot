import { SlashCommandBuilder } from "discord.js";

const sendMatchScorePredictionCommand = new SlashCommandBuilder()
    .setName('send-score-prediction')
    .setDescription('Envía tu predicción para un partido')
    .addStringOption(option =>
      option.setName('prediction')
        .setDescription('Escribe tu predicción en el formato que desees')
        .setRequired(true));

export default sendMatchScorePredictionCommand;