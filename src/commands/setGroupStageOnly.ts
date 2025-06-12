import { SlashCommandBuilder } from "discord.js";

const setGroupStageOnlyCommand = new SlashCommandBuilder()
    .setName('set-group-stage-only')
    .setDescription('Elige si solo quieres apostar en fase de grupos o en todo el torneo')
    .addBooleanOption(option =>
        option.setName('solo_grupos')
            .setDescription('¿Solo apostar en fase de grupos? (true = solo grupos, false = todo el torneo)')
            .setRequired(true)
    );

export default setGroupStageOnlyCommand;