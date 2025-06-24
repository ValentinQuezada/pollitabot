import { CommandInteraction } from "discord.js";
import mongoose from "mongoose";
import { UserStatsSchema } from "../../schemas/user";
import databaseConnection from "../../database/connection";
import { checkRole } from "../events/interactionCreate";


const groupStageStatus = async (interaction: CommandInteraction) => {
    const hasRole = await checkRole(interaction, "ADMIN");
    if (!hasRole) {
    await interaction.reply({
        content: `⛔ No tienes permiso para usar este comando.`,
        ephemeral: true
    });
    return;
    }
    await databaseConnection();
    const UserStats = mongoose.model("UserStats", UserStatsSchema);

    await interaction.deferReply(); // without ephemeral, so everyone can see the message

    const users = await UserStats.find({});

    const stay = users.filter(u => u.onlyGroupStage === false);
    const doNotStay = users.filter(u => u.onlyGroupStage !== false);

    let message = `***💥 FASES DE LLAVES***\n*Inicio: Sábado 28/06, 11:00 hrs*\n*😎 Jugadores que continuarán en las **fases de llaves:***\n`;
    if (stay.length) {
        message += stay.map(u => `<@${u.userId}>`).join(', ') + "\n";
    } else {
        message += "_Ninguno_\n";
    }

    message += `*🏳️‍🌈 Jugadores que **NO** continuarán:*\n`;
    if (doNotStay.length) {
        message += doNotStay.map(u => `<@${u.userId}>`).join(', ');
    } else {
        message += "_Ninguno_\n";
    }

    message += `*(Recuerda actualizar tu **status** con \`/set-group-stage-only\`.)*`

    await interaction.editReply({ content: message });
};

export default groupStageStatus;