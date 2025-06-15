import { SlashCommandBuilder } from "discord.js";

const updateMatchScoreCommand = new SlashCommandBuilder()
  .setName('update-match-score')
  .setDescription('Update the score of a match (partial or final)')
  .addStringOption(option =>
    option.setName('team1')
      .setDescription('Team 1 Name')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('team2')
      .setDescription('Team 2 Name')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('score1')
      .setDescription('Score for Team 1')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('score2')
      .setDescription('Score for Team 2')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('type')
      .setDescription('Is this a partial or final result?')
      .setRequired(true)
      .addChoices(
        { name: 'Partial', value: 'partial' },
        { name: 'Final', value: 'final' }
      )
  )
  .addBooleanOption(option =>
    option.setName('specialhit')
      .setDescription('¿Hubo special hit? (solo para final)')
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option.setName('lategoalhit')
      .setDescription('¿Hubo late goal hit? (solo para final)')
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option.setName('upsethit')
      .setDescription('¿Hubo upset hit? (solo para final)')
      .setRequired(false)
  );

export default updateMatchScoreCommand;