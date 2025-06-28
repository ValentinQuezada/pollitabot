import { SlashCommandBuilder } from "discord.js";

const updateMatchScoreCommand = new SlashCommandBuilder()
  .setName('update-match-score')
  .setDescription('Actualiza el resultado de un partido (parcial or final)')
  .addStringOption(option =>
    option.setName('team1')
      .setDescription('Team 1 Name')
      .setRequired(true)
      .setAutocomplete(true)
    )
  .addStringOption(option =>
    option.setName('team2')
      .setDescription('Team 2 Name')
      .setRequired(true)
      .setAutocomplete(true)
    )
  .addIntegerOption(option =>
    option.setName('score1')
      .setDescription('Score for Team 1')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('score2')
      .setDescription('Score for Team 2')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('advances')
      .setDescription('Quién avanza?')
      .setRequired(false)
      .addChoices(
          { name: 'Equipo 1', value: 'team1' },
          { name: 'Equipo 2', value: 'team2' }
        ))
  .addStringOption(option =>
    option.setName('type')
      .setDescription('¿Resultado parcial o final?')
      .setRequired(true)
      .addChoices(
        { name: 'Parcial', value: 'partial' },
        { name: 'Final', value: 'final' }
      )
  )
  .addBooleanOption(option =>
    option.setName('specialhit')
      .setDescription('¿Hubo special hit? (solo para resultado final)')
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option.setName('lategoalhit')
      .setDescription('¿Hubo late goal hit? (solo para resultado final)')
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option.setName('upsethit')
      .setDescription('¿Hubo upset hit? (solo para resultado final)')
      .setRequired(false)
  );

export default updateMatchScoreCommand;