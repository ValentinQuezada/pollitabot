import { SlashCommandBuilder } from "discord.js";

const sendAwardPredictionCommand = new SlashCommandBuilder()
    .setName('send-award-prediction')
    .setDescription('Envía tu predicción para un award')
    .addStringOption(option =>
      option.setName('award')
        .setDescription('Nombre del award')
        .setRequired(true)
        .setAutocomplete(true) // <-- Activa el autocomplete
    )
    .addStringOption(option =>
      option.setName('prediction')
        .setDescription('Escribe tu predicción en el formato que desees')
        .setRequired(true)
        .setAutocomplete(true)
    );

export default sendAwardPredictionCommand;
