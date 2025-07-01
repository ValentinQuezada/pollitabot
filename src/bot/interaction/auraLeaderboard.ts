import mongoose from "mongoose";
import { AuraPointsSchema } from "../../schemas/aura";
import databaseConnection from "../../database/connection";

const auraLeaderboardCommand = {
  async execute(interaction: any) {
    await databaseConnection();
    const AuraPoints = mongoose.model("AuraPoints", AuraPointsSchema);

    // sorts the leaderboard by totalPoints in descending order
    const leaderboard = await AuraPoints.find({}).sort({ totalPoints: -1 }).lean();

    await interaction.deferReply({ ephemeral: true });

    if (!leaderboard.length) {
      await interaction.editReply({ content: "​📂​ No hay datos de **Aura Points** aún." });
      return;
    }

    let message = "```\n";
    // build the leaderboard (ties are handled)
    message += `​💎 **RANKING DE AURA POINTS**\n`;
    let lastPoints = 0;
    let lastRank = 0;
    for (let idx = 0; idx < leaderboard.length; idx++) {
      const row = leaderboard[idx];
      if (lastPoints != row.totalPoints) {
        lastRank = idx + 1;
        lastPoints = row.totalPoints;
      }
      message += `${lastRank}. <@${row.userId}> ${row.totalPoints} 💠\n`;
    }
    message += '```';

    // top 3 highlights
    const winner = leaderboard[0];
    const second = leaderboard[1];
    const third = leaderboard[2];

    if (winner && second) {
      message += `\n🥇 *¡<@${winner.userId}> lidera la tabla con **${winner.totalPoints}** 💠!*`;
    }
    if (second) {
      message += `\n🥈 *En 2do lugar, <@${second.userId}> con **${second.totalPoints}** 💠.*`;
    }
    if (third) {
      message += `\n🥉 *En 3er lugar, <@${third.userId}> con **${third.totalPoints}** 💠.*`;
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