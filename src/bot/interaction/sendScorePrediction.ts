import { CommandInteraction } from "discord.js";
import { linkMatchScore } from "../../gen/client";
import { retrieveMatches } from "../../database/controllers";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import { startDMConversation } from "../events/directMessage";

const sendScorePredictionCommand = async (interaction: CommandInteraction) => {
    let response = await interaction.deferReply({ ephemeral: true });

    interaction.editReply({ content: "Procesando predicción...",  });

    try {
        const predictionText = interaction.options.get('prediction')?.value as string;
        const matches = await retrieveMatches();
        // console.log('Matches retrieved:', matches);

        const response = await linkMatchScore(
            predictionText,
            matches.map(match => [match.team1, match.team2])
        );
        if (!response.success) {
            await interaction.editReply({ content: response.error });
            return;
        }
        console.log(response.data);

        const match = matches.find(
            m => m.team1 === response.data.team1 && m.team2 === response.data.team2
        );
        if (!match) {
            await interaction.editReply({ content: "❌ No se encontró el partido para la predicción." });
            return;
        }
        console.log(match.datetime, new Date());

        if (new Date() >= match.datetime) {
            await interaction.editReply({ content: "⏰​ Ya no puedes apostar, ¡el partido ya empezó!" });
            return;
        }

        if ((match.matchType === "round-of-16-extra"
            || match.matchType === "quarterfinal-extra"
            || match.matchType === "semifinal-extra"
            || match.matchType === "final-extra")
            && response.data.score.team1 === response.data.score.team2) {
            // if user did not bet in regular time, they cannot bet in extra time
            const allowedToBet = (match as any).allowedToBet;
            if (Array.isArray(allowedToBet) && !allowedToBet.includes(interaction.user.id)) {
                await interaction.editReply({
                    content: "⛔ No puedes apostar en este partido de tiempo extra."
                });
                return;
            }
            try {
                const dmChannel = await interaction.user.createDM();

                startDMConversation(interaction.user.id, {
                    channelId: interaction.channelId,
                    guildId: interaction.guildId,
                    type: "fix-score-prediction",
                    details: {
                        match: match.toJSON(),
                        prediction: response.data,
                    },
                    replyId: interaction.id
                });

                await dmChannel.send(
                    `Hello ${interaction.user.username}! Please fix your prediction for ${match.team1} vs ${match.team2}. Remember that the match is in extra time and the score from ${match.team1} must be different from the score from ${match.team2}.`
                );

                await interaction.editReply({
                    content: "I've opened a DM conversation with you. Please check your direct messages!"
                });

            } catch (error) {
                console.error('Error in chat command:', error);
                await interaction.editReply({
                    content: "Sorry, I couldn't start a DM conversation. Please make sure you have DMs enabled for this server."
                });
            }
            return;
        }

        const db = await databaseConnection();
        const Prediction = db.model("Prediction", PredictionSchema);

        let existingPrediction = await Prediction.findOne({
            userId: interaction.user.id,
            matchId: match._id
        });

        let actionMessage;
        if (existingPrediction) {
            existingPrediction.prediction = response.data.score;
            await existingPrediction.save();
            actionMessage = CALLABLES.updateScorePrediction(interaction.user.id, match.team1, match.team2);
        } else {
            await Prediction.create({
                userId: interaction.user.id,
                matchId: match._id,
                prediction: response.data.score
            });
            actionMessage = CALLABLES.sendScorePrediction(interaction.user.id, match.team1, match.team2);

            const matchFee = match.fee;
            const UserStats = db.model("UserStats", UserStatsSchema);
        }

        if (
            interaction.channel &&
            'send' in interaction.channel &&
            typeof interaction.channel.send === 'function'
        ) {
            await interaction.channel.send(actionMessage);
        }

        await interaction.editReply({ content: `✅ ¡Se guardó tu predicción para el partido **${match.team1} vs. ${match.team2}**! Elegiste: **${response.data.score.team1}-${response.data.score.team2}**.` });
    } catch (error) {
        console.error('Error in send-score-prediction:', error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: '❌ Ocurrió un error al procesar tu predicción.' });
        } else {
            await interaction.reply({ content: '❌ Ocurrió un error al procesar tu predicción.', ephemeral: true });
        }
    }
};

export default sendScorePredictionCommand;