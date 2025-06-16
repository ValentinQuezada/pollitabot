import { SlashCommandBuilder } from "discord.js";

const createAwardCommand = new SlashCommandBuilder()
    .setName('create-award')
    .setDescription('Crea un award para predecir resultados')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Award Name')
        .setRequired(true)
    );

export default createAwardCommand;