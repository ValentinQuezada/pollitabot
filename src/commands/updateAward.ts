import { SlashCommandBuilder } from "discord.js";

const updateAwardResultCommand = new SlashCommandBuilder()
  .setName('update-award-result')
  .setDescription('UActualiza el resultado de un award')
  .addStringOption(option =>
    option.setName('name')
      .setDescription('Award name')
      .setRequired(true)
      .setAutocomplete(true) // <-- Activa el autocomplete
  )
  .addStringOption(option =>
    option.setName('result')
      .setDescription('Nuevo resultado')
      .setRequired(true)
      .setAutocomplete(true)
  );

export default updateAwardResultCommand;
