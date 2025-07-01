import { SlashCommandBuilder } from "discord.js";

const seeAuraCommand = new SlashCommandBuilder()
  .setName('see-my-aura')
  .setDescription('Muestra tus Aura Points por atributo');

export default seeAuraCommand;