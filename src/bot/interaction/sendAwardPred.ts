import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { retrieveAwards } from "../../database/controllers";
import { AwardPredictionSchema } from "../../schemas/awardprediction";
import { UserStatsSchema } from "../../schemas/user";
import { getAwardFee } from "../../utils/fee"; // Necesitas crear esta función
import { ClubWorldCupTeams2025 } from "../events/interactionCreate";
import { mapTeamName } from "../../gen/client";

const sendAwardPredictionCommand = async (interaction: CommandInteraction) => {
    await interaction.deferReply({ ephemeral: true });

    try {
        const awardName = interaction.options.get('award')?.value as string;
        const predictionText = interaction.options.get('prediction')?.value as string;

        // Obtener awards de la base de datos
        const awards = await retrieveAwards();
        const award = awards.find(a => a.name === awardName);
        
        if (!award) {
            await interaction.editReply({ content: "❌ Award no encontrado. Introduce el nombre exacto de la award." });
            return;
        }

        const response = await mapTeamName(
                    predictionText
                );
                if (!response.success) {
                    await interaction.editReply({ content: response.error });
                    return;
                }
                console.log(response.data);

        if(!response) {
            await interaction.editReply({ content: "❌ Equipo no encontrado." });
            return;
        }

        const teamName: string = response.data.team;

        const db = await databaseConnection();
        const AwardPrediction = db.model("AwardPrediction", AwardPredictionSchema);
        const UserStats = db.model("UserStats", UserStatsSchema);

        // Buscar predicción existente
        let existingPrediction = await AwardPrediction.findOne({
            userId: interaction.user.id,
            awardId: award._id
        });

        let actionMessage: string;
        const awardFee = getAwardFee(award.name); // Obtener fee desde tu configuración

        if (existingPrediction) {
            // Actualizar predicción existente (sin cobrar fee nuevamente)
            existingPrediction.prediction = teamName;
            await existingPrediction.save();
            actionMessage = `*✏️ ¡<@${interaction.user.id}> ha actualizado su predicción para **${award.name}**!*`;
        } else {
            // Crear nueva predicción (cobrar fee)
            await AwardPrediction.create({
                userId: interaction.user.id,
                awardId: award._id,
                prediction: teamName
            });
            actionMessage = `*🎯 ¡<@${interaction.user.id}> ha enviado su predicción para **${award.name}**!*`;

            // Actualizar estadísticas del usuario con el fee
            await UserStats.updateOne(
                { userId: interaction.user.id },
                {
                    $inc: {
                        totalPredictions: 1,
                        loss: -awardFee,
                        total: -awardFee
                    }
                },
                { upsert: true }
            );
        }

        // Anunciar en el canal
        if (
            interaction.channel &&
            'send' in interaction.channel &&
            typeof interaction.channel.send === 'function'
        ) {
            await interaction.channel.send(actionMessage);
        }

        await interaction.editReply({ content: `✅ ¡Se guardó tu predicción para la award **${awardName}**! Elegiste: **${teamName}**` });
    } catch (error) {
        console.error('Error en send-award-prediction:', error);
        await interaction.editReply({ 
            content: '❌ Ocurrió un error al procesar tu predicción.' 
        });
    }
};

export default sendAwardPredictionCommand;
