import cron from "node-cron";
import databaseConnection from "../../database/connection";
import { MatchMongoose } from "../../schemas/match";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import BOT_CLIENT from "../init";
import { GENERAL_CHANNEL_ID } from "../../constant/credentials";

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
        const fee = match.fee;
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

    // all predictions for this match
    const predictions = await Prediction.find({ matchId: match._id });

    // group predictions by team1-team2
    const grouped: Record<string, string[]> = {};
    for (const pred of predictions) {
    const key = `${pred.prediction.team1}-${pred.prediction.team2}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(`<@${pred.userId}>`);
    }

    // sort keys by team1-team2 in descending order
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const [a1] = a.split("-").map(Number);
    const [b1] = b.split("-").map(Number);
    return b1 - a1;
    });

    // message with predictions
    let predictionsMsg = "";
    for (const key of sortedKeys) {
    predictionsMsg += `${key}: ${grouped[key].join("/")} ⏺️\n`;
    }

    // final message
    let finalMsg = `🕛​ ¡EMPEZÓ EL PARTIDO **${match.team1} vs. ${match.team2}**! Ya no más apuestas 🙅​.\n${predictionsMsg}`;

    // Enviar al canal
    const guild = BOT_CLIENT.guilds.cache.first(); // O usa el ID de tu guild si tienes varios
    if (guild) {
        const announceChannel = guild.channels.cache.find(
            ch => ch.type === 0 && ch.name.toLowerCase() === "anuncios"
        );
        if (announceChannel && "send" in announceChannel) {
            await announceChannel.send(finalMsg);
        }
    }
  }
});