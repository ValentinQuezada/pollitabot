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
  );

export default updateMatchScoreCommand;