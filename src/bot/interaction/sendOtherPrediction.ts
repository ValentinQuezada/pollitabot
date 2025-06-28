import { CommandInteraction, GuildMember } from "discord.js";
import { GENERAL_CHANNEL_ID, OWNER_ID, REQUIRED_ROLE } from "../../constant/credentials";
import { linkMatchScore, linkExtraTimeMatchScore } from "../../gen/client";
import { retrieveMatches } from "../../database/controllers";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import { startDMConversation } from "../events/directMessage";
import { getSupLabels, isExtraTime } from "../../utils/sup";
import { CALLABLES } from "../../constant/dictionary";

const sendOtherPredictionCommand = async (interaction: CommandInteraction) => {
    const member = interaction.member as GuildMember;
    const hasRole = member.roles.cache.some(role => role.name === REQUIRED_ROLE);

    if (!hasRole) {
    await interaction.reply({
        content: '⛔ No tienes permiso para usar este comando.',
        ephemeral: true
    });
    return;
    }

    
    await interaction.deferReply({ ephemeral: true });

    try {
        const user_id = interaction.options.get('user-id')?.value as string;
        const predictionText = interaction.options.get('prediction')?.value as string;
        const matches = await retrieveMatches();

        let response = await linkMatchScore(predictionText, matches.map(match => [match.team1, match.team2]));
        console.log('Matches retrieved:', matches);
        
        if (response.success === false ) {
            await interaction.editReply({ content: response.error });
            return;
        }
        console.log(response.data);

        const match = matches.find(
            m => m.team1 === response.data?.team1 && m.team2 === response.data?.team2
        );
        if (!match) {
            await interaction.editReply({ content: "❌ No se encontró el partido para la predicción." });
            return;
        }
        console.log(match.datetime, new Date());

        if (isExtraTime(match.matchType)) {
            response = await linkExtraTimeMatchScore(predictionText, [match.team1, match.team2]);
            if (response.success === false) {
                await interaction.editReply({ content: response.error });
                return;
            }
        }

        if (new Date() >= match.datetime) {
            await interaction.editReply({ content: "⏰​ Ya no puedes apostar, ¡el partido ya empezó!" });
            return;
        }

        const { sup } = getSupLabels(match.matchType);

        if (isExtraTime(match.matchType)
            && response.data.score.team1 === response.data.score.team2 && response.data.advances === undefined) {

                const allowedToBet = (match as any).allowedToBet;
            if (Array.isArray(allowedToBet) && !allowedToBet.includes(user_id)) {
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
                    `Hello ${interaction.user.username}! Please fix your prediction of ${user_id} for ${match.team1} vs ${match.team2}${sup}. Remember that the match is in extra time and the score from ${match.team1} must be different from the score from ${match.team2}.`
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
            userId: user_id,
            matchId: match._id
        });

        let actionMessage;
        if (existingPrediction) {
            existingPrediction.prediction = {...response.data.score, advances: response.data.advances};
            await existingPrediction.save();
            actionMessage = CALLABLES.updateOtherPrediction(interaction.user.id, user_id, match.team1, match.team2, sup);
        } else {
            await Prediction.create({
                userId: user_id,
                matchId: match._id,
                prediction: response.data.score
            });
            actionMessage = CALLABLES.sendOtherPrediction(interaction.user.id, user_id, match.team1, match.team2, sup);

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

        await interaction.editReply({ content: `✅ ¡Se guardó tu predicción de @${user_id}> para el partido **${match.team1} vs. ${match.team2}${sup}**! Elegiste: **${response.data.score.team1}-${response.data.score.team2}**. ${response.data.advances ? `El equipo que avanza es: **${response.data[response.data.advances]}**.` : ''}` });
    } catch (error) {
        console.error('Error in send-score-prediction:', error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: '❌ Ocurrió un error al procesar tu predicción.' });
        } else {
            await interaction.reply({ content: '❌ Ocurrió un error al procesar tu predicción.', ephemeral: true });
        }
    }
};

export default sendOtherPredictionCommand;