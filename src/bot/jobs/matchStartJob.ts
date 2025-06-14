import cron from "node-cron";
import databaseConnection from "../../database/connection";
import { MatchMongoose } from "../../schemas/match";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import BOT_CLIENT from "../init";
import { GENERAL_CHANNEL_ID } from "../../constant/credentials";
import { getMatchFee } from "../../utils/fee";

cron.schedule("* * * * *", async () => {
  const db = await databaseConnection();
  const Match = db.model("Match", MatchMongoose);
  const Prediction = db.model("Prediction", PredictionSchema);
  const UserStats = db.model("UserStats", UserStatsSchema);

  const nowUTC = new Date();

  // search for matches that have started but not finished
  const matches = await Match.find({
    isFinished: false,
    datetime: { $lte: nowUTC },
    hasStarted: { $ne: true } // avoid repeating announcements
  });

  for (const match of matches) {
    // penalize users who did not predict
    const users = await UserStats.find({ onlyGroupStage: false });
    for (const user of users) {
      const prediction = await Prediction.findOne({ userId: user.userId, matchId: match._id });
      if (!prediction && match.matchType !== "group-regular") {
        const fee = getMatchFee(match.matchType);
        const penalty = fee / 2;
        user.loss -= penalty;
        user.missedNonGroupPredictions += 1;
        user.total -= penalty;
        await user.save();
      }
    }

    // mark the match as started
    match.hasStarted = true;
    await match.save();

    // announce in the general channel
    const channel = await BOT_CLIENT.channels.fetch(GENERAL_CHANNEL_ID);
    if (channel && "send" in channel) {
      await channel.send(`🕛​ ¡Empezó el partido **${match.team1} vs ${match.team2}**! Ya no más apuestas 🙅​.`);
    }
  }
});