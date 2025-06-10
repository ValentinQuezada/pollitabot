import { SlashCommandBuilder } from "discord.js";

const sendMatchScorePredictionCommand = new SlashCommandBuilder()
    .setName('send-score-prediction')
    .setDescription('Send a match score prediction')
    .addStringOption(option =>
      option.setName('match')
        .setDescription('Match ID')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('score')
        .setDescription('Score (team1:team2)')
        .setRequired(true));

export default sendMatchScorePredictionCommand;