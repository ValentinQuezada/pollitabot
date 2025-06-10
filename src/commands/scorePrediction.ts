import { SlashCommandBuilder } from "discord.js";

const sendMatchScorePredictionCommand = new SlashCommandBuilder()
    .setName('send-score-prediction')
    .setDescription('Send a match score prediction')
    .addStringOption(option =>
      option.setName('prediction')
        .setDescription('Type your prediction in any format you want')
        .setRequired(true));

export default sendMatchScorePredictionCommand;