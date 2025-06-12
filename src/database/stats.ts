import databaseConnection from "./connection";
import { PredictionSchema } from "../schemas/prediction";
import { UserStatsSchema } from "../schemas/user";

export async function processMatchResults(matchId: string, actualScore: {team1: number, team2: number}) {
  const db = await databaseConnection();
  const Prediction = db.model("Prediction", PredictionSchema);
  const UserStats = db.model("UserStats", UserStatsSchema);

  const predictions = await Prediction.find({ matchId });
  const totalPool = predictions.length * 5;
  const winners = predictions.filter(p =>
    p.prediction.team1 === actualScore.team1 &&
    p.prediction.team2 === actualScore.team2
  );

  // update noWinners predictions
  if (winners.length === 0) {
    for (const pred of predictions) {
      await UserStats.updateOne(
        { userId: pred.userId },
        {
          $inc: {
            totalPredictions: 1,
            incorrectPredictions: 1,
            loss: -5,
            total: -5,
            streak: 0,
            noWinnersPredictions: 1
          }
        },
        { upsert: true }
      );
    }
    return;
  }

  // if there are winners, calculate the gain per winner
  const gainPerWinner = totalPool / winners.length;

  for (const pred of predictions) {
    const isWinner = winners.some(w => w.userId === pred.userId);
    await Prediction.updateOne({ _id: pred._id }, { isWinner });

    if (isWinner) {
      await UserStats.updateOne(
        { userId: pred.userId },
        {
          $inc: {
            totalPredictions: 1,
            correctPredictions: 1,
            gain: gainPerWinner,
            loss: -5,
            total: gainPerWinner - 5,
            streak: 1
          }
        },
        { upsert: true }
      );
      // increment streak if it was greater than 1
      const stats = await UserStats.findOne({ userId: pred.userId });
      if (stats && stats.streak > 1) {
        await UserStats.updateOne({ userId: pred.userId }, { $inc: { streak: 1 } });
      }
    } else {
      await UserStats.updateOne(
        { userId: pred.userId },
        {
          $inc: {
            totalPredictions: 1,
            incorrectPredictions: 1,
            loss: -5,
            total: -5
          },
          $set: { streak: 0 }
        },
        { upsert: true }
      );
    }
  }
}