import mongoose from "mongoose";
import { AuraPointsSchema } from "../../schemas/aura";
import databaseConnection from "../../database/connection";

const ATTRIBUTES = [
  { key: "matchesHit", label: "🎯" },
  { key: "uniqueHit", label: "🦄" },
  { key: "specialHit", label: "⭐" },
  { key: "lateGoalHit", label: "⏰" },
  { key: "upsetHit", label: "⚡" },
  { key: "streak3plus", label: "🔥" },
  { key: "topProfit", label: "💰" },
  { key: "topWinRate", label: "📈" },
  { key: "topStreak", label: "🏅" },
  { key: "awardHit", label: "🏆" },
  { key: "totalPoints", label: "💠" }
];

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

    // breakdown personal (ephemeral)
    const userAura = leaderboard.find(row => row.userId === interaction.user.id) as any;
    if (userAura) {
      let privateMessage = `🔎 **Tus Aura Points (💠) por atributo:**\n`;
      ATTRIBUTES.forEach(attr => {
        if (attr.key !== "totalPoints") {
          privateMessage += `${attr.label} \`${attr.key}\`: **${userAura[attr.key] ?? 0}**\n`;
        }
      });
      privateMessage += `💠 **totales: ${userAura.totalPoints}**`;
      await interaction.reply({ content: privateMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: message });
      return;
    }

    // send the leaderboard to the channel
    await interaction.channel.send({ content: message });
  }
};

export default auraLeaderboardCommand;