import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { checkRole } from "../events/interactionCreate";
import { mapTeamName } from "../../gen/client";
import { getAwardFee } from "../../utils/fee";
import { AwardPredictionSchema } from "../../schemas/awardprediction";
import { UserStatsSchema } from "../../schemas/user";

const updateAwardResultCommand = async (interaction: CommandInteraction) => {

  const hasRole = await checkRole(interaction, "ADMIN");
      
  if (!hasRole) {
    await interaction.reply({
      content: `⛔ No tienes permiso para usar este comando.`,
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const name = interaction.options.get('name')?.value as string;
  const result = interaction.options.get('result')?.value as string;

  const db = await databaseConnection();
  const Award = db.model("Award");
  const Prediction = db.model("Prediction", AwardPredictionSchema);
  const UserStats = db.model("UserStats", UserStatsSchema);

  const award = await Award.findOne({ name });
  if (!award) {
    await interaction.editReply({ content: "❌ Award no encontrada. Introduce el nombre exacto de la award."});
    return;
  }

  const response = await mapTeamName(result);
  if (!response.success) {
      await interaction.editReply({ content: "❌ Equipo no encontrado." });
      return;
  }
  console.log(response.data);

  award.result = response.data;
  await award.save();

  let message = `🏆 Resultado actualizado para **${award.name}**: ¡**${award.result}**!`;
  if (
    interaction.channel &&
    'send' in interaction.channel &&
    typeof interaction.channel.send === 'function'
  ) {
    await interaction.channel.send(message);
  }

  await interaction.editReply({ content: `✅ ¡Se guardó el resultado para la award **${award.name}** como **${award.result}**.`});


  // get all predictions for this match
  const predictions = await Prediction.find({ awardId: award._id });
  const winners = predictions.filter(p =>
    p.prediction == award.result
  );
  const winnerIds = new Set(winners.map(w => w.userId));
  const allUserIds = predictions.map(p => p.userId);

  const matchFee = getAwardFee(award.name);

  // calculate the pool and gain per winner
  const pool = allUserIds.length * matchFee;
  const gainPerWinner = winners.length > 0 ? pool / winners.length : 0;

  // for each prediction, update user stats
  for (const prediction of predictions) {
    const userId = prediction.userId;
    const isWinner = winnerIds.has(userId);

    const userStats = await UserStats.findOne({ userId }) || new UserStats({ userId });

    // update user stats
    // userStats.totalPredictions = (userStats.totalPredictions || 0) + 1;

    // reset streak if user did not bet
    if(winners.length > 0) {
      // users who did not bet on this match
      const nonGroupStageUsers = await UserStats.find({ onlyGroupStage: false });
      const userIdsWithPrediction = predictions.map(p => p.userId);
      const nonBettors = nonGroupStageUsers
      .filter(u => !userIdsWithPrediction.includes(u.userId))
      .map(u => u.userId);
      for (const userId of nonBettors) {
        const userStats = await UserStats.findOne({ userId }) || new UserStats({ userId });
        userStats.streak = 0;
        await userStats.save();
      }
    }

    if (isWinner) {
      userStats.correctPredictions = (userStats.correctPredictions || 0) + 1;
      userStats.streak = (userStats.streak || 0) + 1;
      userStats.gain = (userStats.gain || 0) + gainPerWinner;
      userStats.total = (userStats.total || 0) + gainPerWinner; // add gain
      
      //update max streak if current streak is greater
      if ((userStats.streak || 0) > (userStats.maxStreak || 0)) {
        userStats.maxStreak = userStats.streak;
      }
    } else {
      // if no winners, increment noWinnersPredictions
      if (winners.length === 0) {
        // users who did not bet on this match
        const nonGroupStageUsers = await UserStats.find({ onlyGroupStage: false });
        const userIdsWithPrediction = predictions.map(p => p.userId);
        const nonBettors = nonGroupStageUsers
        .filter(u => !userIdsWithPrediction.includes(u.userId))
        .map(u => u.userId);
        for (const userId of nonBettors) {
          const userStats = await UserStats.findOne({ userId }) || new UserStats({ userId });
          userStats.loss = (userStats.loss || 0) + matchFee;
          userStats.total = (userStats.total || 0) + matchFee;
          await userStats.save();
        }

        userStats.noWinnersPredictions = (userStats.noWinnersPredictions || 0) + 1;
        userStats.loss = (userStats.loss || 0) + matchFee; // no gain, but no loss either
        userStats.total = (userStats.total || 0) + matchFee; // deduct match fee
        // streak remains the same
      } else {
        userStats.incorrectPredictions = (userStats.incorrectPredictions || 0) + 1;
        userStats.streak = 0;
      }
    }

    // calculate win rate
    const correct = userStats.correctPredictions || 0;
    const total = userStats.totalPredictions || 0;
    userStats.winRate = total > 0 ? correct / total : 0;

    await userStats.save();
  }
};

export default updateAwardResultCommand;
