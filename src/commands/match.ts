import { SlashCommandBuilder } from "discord.js";

const createMatchCommand = new SlashCommandBuilder()
    .setName('create-match')
    .setDescription('Crea un partido para predecir resultados')
    .addStringOption(option =>
      option.setName('team1')
        .setDescription('Equipo 1')
        .setRequired(true)
        .setAutocomplete(true))
    .addStringOption(option =>
      option.setName('team2')
        .setDescription('Equipo 2')
        .setRequired(true)
        .setAutocomplete(true))
    .addStringOption(option =>
      option.setName('datetime')
        .setDescription('Fecha del partido (YYYY-MM-DD HH:MM)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('group')
        .setDescription('Letra del grupo (A, B, C, etc.)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('matchtype')
        .setDescription('Tipo de partido')
        .setRequired(true)
        .addChoices(
          { name: 'Group Regular', value: 'group-regular' },
          { name: 'Round of 16 Regular', value: 'round-of-16-regular' },
          { name: 'Round of 16 Extra', value: 'round-of-16-extra' },
          { name: 'Quarterfinal Regular', value: 'quarterfinal-regular' },
          { name: 'Quarterfinal Extra', value: 'quarterfinal-extra' },
          { name: 'Semifinal Regular', value: 'semifinal-regular' },
          { name: 'Semifinal Extra', value: 'semifinal-extra' },
          { name: 'Final Regular', value: 'final-regular' },
          { name: 'Final Extra', value: 'final-extra' }
        )
    )
    .addIntegerOption(option =>
      option.setName('fee')
        .setDescription('Fee del partido (por defecto 5)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    );

export default createMatchCommand;