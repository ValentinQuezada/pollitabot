import { CommandInteraction } from "discord.js";
import { linkMatchScore } from "../../gen/client";
import { retrieveMatches } from "../../database/controllers";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";

export const sendScorePredictionCommand = async (interaction: CommandInteraction) => {
  await interaction.deferReply({ ephemeral: true });

  try {
    const predictionText = interaction.options.get('prediction')?.value as string;
    const matches = await retrieveMatches();
    console.log('Matches retrieved:', matches);

    const response = await linkMatchScore(
      predictionText,
      matches.map(match => match.team1 + " vs " + match.team2)
    );
    if (!response.success) {
      await interaction.editReply({ content: response.error });
      return;
    }

    const match = matches.find(
      m => m.team1 === response.data.team1 && m.team2 === response.data.team2
    );
    if (!match) {
      await interaction.editReply({ content: "No se encontró el partido para la predicción." });
      return;
    }
    console.log(match.datetime, new Date());
    
    if (new Date() >= match.datetime) {
      await interaction.editReply({ content: "Ya no puedes apostar, el partido ya empezó." });
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
      actionMessage = `*¡<@${interaction.user.id}> ha actualizado sus resultados para ${match.team1} vs ${match.team2}!*`;
    } else {
      await Prediction.create({
        userId: interaction.user.id,
        matchId: match._id,
        prediction: response.data.score
      });
      actionMessage = `*¡<@${interaction.user.id}> ha enviado sus resultados para ${match.team1} vs ${match.team2}!*`;
    }

    if (
      interaction.channel &&
      'send' in interaction.channel &&
      typeof interaction.channel.send === 'function'
    ) {
      await interaction.channel.send(actionMessage);
    }

    const UserStats = db.model("UserStats", UserStatsSchema);
    await UserStats.updateOne(
      { userId: interaction.user.id },
      {
        $inc: {
          totalPredictions: 1,
          loss: -5,
          total: -5
        }
      },
      { upsert: true }
    );

    await interaction.editReply({ content: '¡Predicción guardada!' });
  } catch (error) {
    console.error('Error in send-score-prediction:', error);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: 'Ocurrió un error al procesar tu predicción.' });
    } else {
      await interaction.reply({ content: 'Ocurrió un error al procesar tu predicción.', ephemeral: true });
    }
  }
};
