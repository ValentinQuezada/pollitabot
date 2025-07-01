import mongoose from "mongoose";
import { AuraPointsSchema } from "../../schemas/aura";
import databaseConnection from "../../database/connection";

const auraLeaderboardCommand = {
  async execute(interaction: any) {
    await databaseConnection();
    const AuraPoints = mongoose.model("AuraPoints", AuraPointsSchema);

    // sorts the leaderboard by totalPoints in descending order
    const leaderboard = await AuraPoints.find({}).sort({ totalPoints: -1 }).lean();

    if (!leaderboard.length) {
      await interaction.reply({ content: "​📂​ No hay datos de **Aura Points** aún.", ephemeral: true });
      return;
    }

    // build the leaderboard (ties are handled)
    let message = `​💎 **RANKING DE AURA POINTS**\n`;
    let lastPoints = null;
    let lastRank = 0;
    let realRank = 0;
    for (let idx = 0; idx < leaderboard.length; idx++) {
      const row = leaderboard[idx];
      realRank++;
      if (lastPoints === row.totalPoints) {
        // same points as last, keep the same rank
        message += `${lastRank}. <@${row.userId}> ${row.totalPoints} 💠\n`;
      } else {
        lastRank = realRank;
        message += `${lastRank}. <@${row.userId}> ${row.totalPoints} 💠\n`;
        lastPoints = row.totalPoints;
      }
    }

    // top 3 highlights
    const winner = leaderboard[0];
    const second = leaderboard[1];
    const third = leaderboard[2];

    if (winner && second) {
      const diff = winner.totalPoints - second.totalPoints;
      message += `\n🥇 *¡<@${winner.userId}> lidera la tabla con **${winner.totalPoints}** 💠!*`;
    }
    if (second) {
      message += `\n🥈 *En 2do lugar, <@${second.userId}> con **${second.totalPoints}** 💠.*`;
    }
    if (third) {
      message += `\n🥉 *En 3er lugar, <@${third.userId}> con **${third.totalPoints}** 💠.*`;
    }

    // send the leaderboard to the channel
    await interaction.channel.send({ content: message });
  }
};

export default auraLeaderboardCommand;