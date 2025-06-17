import { SlashCommandBuilder } from "discord.js";

const sendMatchOtherPredictionCommand = new SlashCommandBuilder()
    .setName('send-other-prediction')
    .setDescription('Envía la predicción de alguien más para un partido')
    .addStringOption(option =>
      option.setName('user-id')
        .setDescription('Ingresa el user-id de quien va a predecir')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('prediction')
        .setDescription('Escribe la predicción en el formato que desees')
        .setRequired(true));

export default sendMatchOtherPredictionCommand;