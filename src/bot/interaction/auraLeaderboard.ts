import mongoose from "mongoose";
import { UserStatsSchema } from "../../schemas/user";
import databaseConnection from "../../database/connection";

const auraLeaderboardCommand = {
  async execute(interaction: any) {
    await databaseConnection();
    const UserStats = mongoose.model("UserStats", UserStatsSchema);

    // sorts the leaderboard by totalPoints in descending order
    const leaderboard = await UserStats.find({}).sort({ auraPoints: -1 }).lean();

    await interaction.deferReply({ ephemeral: true });

    if (!leaderboard.length) {
      await interaction.editReply({ content: "​📂​ No hay datos de **Aura Points** aún." });
      return;
    }

    // build the leaderboard (ties are handled)
    let message = `​💎 **RANKING DE AURA POINTS**\n`;
    let lastPoints = null;
    let lastRank = 0;
    for (let idx = 0; idx < leaderboard.length; idx++) {
      const row = leaderboard[idx];
      if (lastPoints != row.auraPoints) {
        lastRank = idx + 1;
        lastPoints = row.auraPoints;
      }
      message += `\u200b${lastRank}. <@${row.userId}> ${row.auraPoints} 💠\n`;
    }


    // top 3 highlights
    const winner = leaderboard[0];
    const second = leaderboard[1];
    const third = leaderboard[2];

    if (winner) {
      message += `\n🥇 *¡<@${winner.userId}> lidera la tabla con **${winner.auraPoints}** 💠!*`;
    }
    if (second) {
      message += `\n🥈 *En 2do lugar, <@${second.userId}> con **${second.auraPoints}** 💠.*`;
    }
    if (third) {
      message += `\n🥉 *En 3er lugar, <@${third.userId}> con **${third.auraPoints}** 💠.*`;
    }

    if (interaction.channel && 'send' in interaction.channel && typeof interaction.channel.send === 'function') {
      await interaction.channel.send(message);
      await interaction.editReply({ content: "✅ Listado enviado al canal.", ephemeral: true });
    } else {
      await interaction.editReply({ content: "❌ No se pudo enviar el listado al canal.", ephemeral: true });
    }
  }
};

export default auraLeaderboardCommand;