import { SlashCommandBuilder } from "discord.js";

const updateAwardResultCommand = new SlashCommandBuilder()
  .setName('update-award-result')
  .setDescription('Update the result of an award')
  .addStringOption(option =>
    option.setName('name')
      .setDescription('Award name')
      .setRequired(true)
      .setAutocomplete(true) // <-- Activa el autocomplete
  )
  .addStringOption(option =>
    option.setName('result')
      .setDescription('New result for the award')
      .setRequired(true)
      .setAutocomplete(true)
  );

export default updateAwardResultCommand;
