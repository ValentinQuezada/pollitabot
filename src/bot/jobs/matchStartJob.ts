import cron from "node-cron";
import databaseConnection from "../../database/connection";
import { MatchMongoose } from "../../schemas/match";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import BOT_CLIENT from "../init";
import { GENERAL_CHANNEL_ID } from "../../constant/credentials";
// import sendMatchStats from "../interaction/sendMatchStats";

cron.schedule("* * * * *", async () => {
  const db = await databaseConnection();
  const Match = db.model("Match", MatchMongoose);
  const Prediction = db.model("Prediction", PredictionSchema);
  const UserStats = db.model("UserStats", UserStatsSchema);

  const nowUTC = new Date();

  // const tenMinutesLater = new Date(nowUTC.getTime() + 10 * 60 * 1000);
  // const matchesSoon = await Match.find({
  //   isFinished: false,
  //   hasStarted: { $ne: true },
  //   datetime: { $gt: nowUTC, $lte: tenMinutesLater },
  //   statsAnnounced: { $ne: true } // do not repeat announcements
  // });

  // for (const match of matchesSoon) {
  //   // get general channel
  //   const guild = BOT_CLIENT.guilds.cache.first();
  //   if (guild) {
  //     const generalChannel = guild.channels.cache.get(GENERAL_CHANNEL_ID);
  //     if (generalChannel && "send" in generalChannel) {
  //       // call sendMatchStats
  //       await sendMatchStats({
  //         channel: generalChannel,
  //         matchId: match._id,
  //         reply: async ({ content }: { content: string }) => {
  //           await generalChannel.send(content);
  //         }
  //       } as any);
  //     }
  //   }
  //   // mark the match as stats announced
  //   match.statsAnnounced = true;
  //   await match.save();
  // }

  // search for matches that have started but not finished
  const matches = await Match.find({
    isFinished: false,
    datetime: { $lte: nowUTC },
    hasStarted: { $ne: true } // avoid repeating announcements
  });

  for (const match of matches) {
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

    // missed users
    let missedUserIds: string[] = [];
    if (
      match.matchType === "round-of-16-extra" ||
      match.matchType === "quarterfinal-extra" ||
      match.matchType === "semifinal-extra" ||
      match.matchType === "final-extra"
    ) {
      // allowedToBet
      const allowedToBet: string[] = (match as any).allowedToBet || [];
      const userIdsWithPrediction = predictions.map(p => p.userId);
      missedUserIds = allowedToBet.filter(uid => !userIdsWithPrediction.includes(uid));
    } else {
      // only group stage users
      const nonGroupStageUsers = await UserStats.find({ onlyGroupStage: false });
      const userIdsWithPrediction = predictions.map(p => p.userId);
      missedUserIds = nonGroupStageUsers
        .filter(u => !userIdsWithPrediction.includes(u.userId))
        .map(u => u.userId);
    }

    // sort keys by team1-team2 in descending order
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const [a1, a2] = a.split("-").map(Number);
      const [b1, b2] = b.split("-").map(Number);
      const totalA = a1 + a2;
      const totalB = b1 + b2;
      if (totalA != totalB) return totalB - totalA;
      return b1 - a1;
    });

    // message with predictions
    let predictionsMsg = "";
    for (const key of sortedKeys) {
    predictionsMsg += `${key}: ${grouped[key].join("/")}\n`;
    }

    let missedMsg = "";
    if (missedUserIds.length) {
      missedMsg = `❌ No apostaron: ${missedUserIds.map(uid => `<@${uid}>`).join(" / ")}\n`;
    }

    // final message
    let finalMsg = `🕛​ **¡EMPEZÓ EL PARTIDO!**\n***${match.team1} vs. ${match.team2}***\n*Ya no más apuestas* 🙅​\n${predictionsMsg}${missedMsg}`;

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