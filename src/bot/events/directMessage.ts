import { Message } from "discord.js";
import BOT_CLIENT from "../init";
import ConversationManager from "../conversation/manager";
import { fixScoreExtraTime } from "../../gen/client";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";

const conversationManager = ConversationManager.getInstance();

export const startDMConversation = (userId: string, initialContext: Record<string, any> = {}) => {
    conversationManager.startConversation(userId, initialContext);
};

export const endDMConversation = (userId: string) => {
    conversationManager.endConversation(userId);
};

const directMessageEvent = async (message: Message) => {
    if (message.author.bot || !message.channel.isDMBased()) return;

    if (!conversationManager.isActiveConversation(message.author.id)) return;

    try {
        const userMessage = message.content.toLowerCase();
        const userId = message.author.id;
        const context = conversationManager.getContext(userId) || {};

        conversationManager.updateLastInteraction(userId);

        if (userMessage.includes('bye') || userMessage.includes('goodbye') || userMessage.includes('end')) {
            await message.reply("Goodbye! If you want to chat again, use the /chat command in the server.");
            endDMConversation(userId);
            return;
        }

        if (context.reason.content === "fix-score-prediction") {
            const predictionQuery = message.content;
            const fixScoreResponse = await fixScoreExtraTime(predictionQuery, context.reason.prediction);
            if (!fixScoreResponse.success) {
                await message.reply("Try again, " + fixScoreResponse.error);
                return;
            }

            console.log(context.reason.match.datetime, new Date());

            if (new Date() >= context.reason.match.datetime) {
                await message.reply("Ya no puedes apostar, el partido ya empezó.");
                endDMConversation(userId);
                return;
            }

            if (fixScoreResponse.data.score.team1 === fixScoreResponse.data.score.team2) {
                await message.reply("Los equipos no pueden tener el mismo resultado en partido extra. Intenta de nuevo. (\"end\" para terminar la conversación)");
                return;
            }

            const db = await databaseConnection();
            const Prediction = db.model("Prediction", PredictionSchema);

            let existingPrediction = await Prediction.findOne({
                userId: userId,
                matchId: context.reason.match._id
            });

            let actionMessage;
            if (existingPrediction) {
                existingPrediction.prediction = fixScoreResponse.data.score;
                await existingPrediction.save();
                actionMessage = `*¡<@${userId}> ha actualizado sus resultados para ${context.reason.match.team1} vs ${context.reason.match.team2}!*`;
            } else {
                await Prediction.create({
                    userId: userId,
                    matchId: context.reason.match._id,
                    prediction: fixScoreResponse.data.score
                });
                actionMessage = `*¡<@${userId}> ha enviado sus resultados para ${context.reason.match.team1} vs ${context.reason.match.team2}!*`;
            }


            const channel = await BOT_CLIENT.channels.fetch(context.channelId);
            if (channel && 'send' in channel && typeof channel.send === 'function') {
                await channel.send(actionMessage);
            }

            const UserStats = db.model("UserStats", UserStatsSchema);
            await UserStats.updateOne(
                { userId: userId },
                {
                    $inc: {
                        totalPredictions: 1,
                        loss: -5,
                        total: -5
                    }
                },
                { upsert: true }
            );

            endDMConversation(userId);
            await message.reply({ content: '¡Predicción guardada!' });
        }
    } catch (error) {
        console.error('Error in DM conversation:', error);
        await message.reply("Sorry, I encountered an error while processing your message.");
    }
};

export default directMessageEvent;
