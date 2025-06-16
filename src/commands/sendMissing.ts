import { SlashCommandBuilder } from "discord.js";

const sendMissingCommand = new SlashCommandBuilder()
  .setName('send-missing')
  .setDescription('Menciona a los jugadores que no han enviado predicción para un partido')
  .addStringOption(option =>
    option.setName('team1')
      .setDescription('Equipo A')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption(option =>
    option.setName('team2')
      .setDescription('Equipo B')
      .setRequired(true)
      .setAutocomplete(true)
  );

export default sendMissingCommand;