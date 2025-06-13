import { SlashCommandBuilder } from "discord.js";

const sendAwardPredictionCommand = new SlashCommandBuilder()
    .setName('send-award-prediction')
    .setDescription('Send a prediction for an award')
    .addStringOption(option =>
      option.setName('award')
        .setDescription('Name of the award')
        .setRequired(true)
        .setAutocomplete(true) // <-- Activa el autocomplete
    )
    .addStringOption(option =>
      option.setName('prediction')
        .setDescription('Type your award prediction in any format you want')
        .setRequired(true)
        .setAutocomplete(true)
    );

export default sendAwardPredictionCommand;
