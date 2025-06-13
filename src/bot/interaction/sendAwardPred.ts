import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { retrieveAwards } from "../../database/controllers";
import { AwardPredictionSchema } from "../../schemas/awardprediction";
import { UserStatsSchema } from "../../schemas/user";
import { getAwardFee } from "../../utils/fee"; // Necesitas crear esta función
import { ClubWorldCupTeams2025 } from "../events/interactionCreate";

const sendAwardPredictionCommand = async (interaction: CommandInteraction) => {
    await interaction.deferReply({ ephemeral: true });

    try {
        const awardName = interaction.options.get('award')?.value as string;
        const predictionText = interaction.options.get('prediction')?.value as string;

        // Obtener awards de la base de datos
        const awards = await retrieveAwards();
        const award = awards.find(a => a.name === awardName);
        
        if (!award) {
            await interaction.editReply({ content: "❌ Award no encontrado." });
            return;
        }

        const team = ClubWorldCupTeams2025.find(a => a === predictionText);

        if(!team) {
            await interaction.editReply({ content: "❌ Equipo no encontrado." });
            return;
        }

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
            existingPrediction.prediction = predictionText;
            await existingPrediction.save();
            actionMessage = `✏️ <@${interaction.user.id}> actualizó su predicción para **${award.name}**`;
        } else {
            // Crear nueva predicción (cobrar fee)
            await AwardPrediction.create({
                userId: interaction.user.id,
                awardId: award._id,
                prediction: predictionText
            });
            actionMessage = `🎯 <@${interaction.user.id}> envió una predicción para **${award.name}**`;

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

        await interaction.editReply({ content: '✅ ¡Predicción para award guardada!' });
    } catch (error) {
        console.error('Error en send-award-prediction:', error);
        await interaction.editReply({ 
            content: '❌ Ocurrió un error al procesar tu predicción.' 
        });
    }
};

export default sendAwardPredictionCommand;
