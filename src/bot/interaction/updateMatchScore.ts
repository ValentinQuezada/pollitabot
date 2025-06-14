import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { getMatchFee } from "../../utils/fee";
import { MatchMongoose } from "../../schemas/match";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import { checkRole } from "../events/interactionCreate";
import { updateAuraPointsForMatch } from "../../utils/updateAuraPoints";

const updateMatchScoreCommand = async (interaction: CommandInteraction) => {
  const hasRole = await checkRole(interaction, "ADMIN");
  if (!hasRole) {
    await interaction.reply({
      content: `⛔ No tienes permiso para usar este comando.`,
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const team1 = interaction.options.get('team1')?.value as string;
  const team2 = interaction.options.get('team2')?.value as string;
  const score1 = interaction.options.get('score1')?.value as number;
  const score2 = interaction.options.get('score2')?.value as number;
  const type = interaction.options.get('type')?.value as string;

  const db = await databaseConnection();
  const Match = db.model("Match", MatchMongoose);
  const Prediction = db.model("Prediction", PredictionSchema);
  const UserStats = db.model("UserStats", UserStatsSchema);

  const match = await Match.findOne({ team1, team2, hasStarted: true, isFinished: false });
  if (!match) {
    await interaction.reply({ content: "Match not found.", ephemeral: true });
    return;
  }

  // update match score
  match.score = { team1: score1, team2: score2 };

  // only update flag if type is final
  if (type === 'final') {
    const specialHit = interaction.options.get('specialhit')?.value as boolean | undefined;
    const lateGoalHit = interaction.options.get('lategoalhit')?.value as boolean | undefined;
    const upsetHit = interaction.options.get('upsethit')?.value as boolean | undefined;

    if (typeof specialHit === "boolean") match.specialHit = specialHit;
    if (typeof lateGoalHit === "boolean") match.lateGoalHit = lateGoalHit;
    if (typeof upsetHit === "boolean") match.upsetHit = upsetHit;

    match.isFinished = true;
  }

  await match.save();

  // get all predictions for this match
  const predictions = await Prediction.find({ matchId: match._id });
  const winners = predictions.filter(p =>
    p.prediction.team1 === score1 && p.prediction.team2 === score2
  );

  if (type === 'partial' || type === 'final') {
    let message = type === 'partial'
      ? `⏸️ **¡Medio tiempo!** Resultado parcial: ${team1} (${score1} - ${score2}) ${team2} \n`
      : `🏁 **¡Tiempo completo!** Resultado final: ${team1} (${score1} - ${score2}) ${team2}\n`;

    // group predictions by score
    const predictionsByScore: Record<string, string[]> = {};
    predictions.forEach(p => {
      const key = `${p.prediction.team1}-${p.prediction.team2}`;
      if (!predictionsByScore[key]) predictionsByScore[key] = [];
      predictionsByScore[key].push(`<@${p.userId}>`);
    });

    // determine the emoji for each prediction
    function getEmoji(pred: { team1: number; team2: number }): string {
      if (pred.team1 === score1 && pred.team2 === score2) return "✅";
      if (type === 'partial') {
        if (pred.team1 < score1 || pred.team2 < score2) return "❌";
        return "🟡";
      } else {
        return "❌";
      }
    }

    // sort predictions by score
    const sortedScores = Object.keys(predictionsByScore).sort((a, b) => {
      const [a1, a2] = a.split('-').map(Number);
      const [b1, b2] = b.split('-').map(Number);
      const totalA = a1 + a2;
      const totalB = b1 + b2;
      if (totalA !== totalB) return totalA - totalB;
      return a1 - b1;
    });

    // list predictions by score
    for (const score of sortedScores) {
      const [pred1, pred2] = score.split('-').map(Number);
      const emoji = getEmoji({ team1: pred1, team2: pred2 });
      message += `- ${score}: ${predictionsByScore[score].join('/')} ${emoji}\n`;
    }

    // winners
    if (winners.length > 0) {
      message += type === 'partial'
        ? `\nGanando por el momento: ${winners.map(p => `<@${p.userId}>`).join(', ')}`
        : `\nGanador(es): ${winners.map(p => `<@${p.userId}>`).join(', ')}`;
    } else {
      message += type === 'partial'
        ? `\nNadie ha atinado por ahora.`
        : `\nNadie atinó el resultado.`;
    }

    if (
      interaction.channel &&
      'send' in interaction.channel &&
      typeof interaction.channel.send === 'function'
    ) {
      await interaction.channel.send(message);
    }

    await interaction.reply({
      content: type === 'partial'
        ? "Partial result updated and announced."
        : "Final result updated, announced, and stats updated.",
      ephemeral: true
    });

    // if final, update user stats
    if (type === 'final') {
      match.isFinished = true;
      await match.save();

      // get all predictions for this match
      const predictions = await Prediction.find({ matchId: match._id });
      const winners = predictions.filter(p =>
        p.prediction.team1 === score1 && p.prediction.team2 === score2
      );
      const winnerIds = new Set(winners.map(w => w.userId));
      const allUserIds = predictions.map(p => p.userId);

      const matchFee = getMatchFee(match.matchType);

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
      // update aura points for winners
      await updateAuraPointsForMatch(match._id.toString());
    }
  }
};

export default updateMatchScoreCommand;
