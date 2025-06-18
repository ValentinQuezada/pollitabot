import { SlashCommandBuilder } from "discord.js";

const assignAuraTopBonusesCommand = new SlashCommandBuilder()
    .setName('assignauratopbonuses')
    .setDescription('Asigna los bonus de aura points a los usuarios top en profit, winrate y streak');

export default assignAuraTopBonusesCommand;