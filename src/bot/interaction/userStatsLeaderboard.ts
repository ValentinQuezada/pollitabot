import mongoose from "mongoose";
import { UserStatsSchema } from "../../schemas/user";
import databaseConnection from "../../database/connection";

const COLS = [
  { key: "totalPredictions", label: "🎲" },
  { key: "correctPredictions", label: "✅" },
  { key: "noWinnersPredictions", label: "⏺️" },
  { key: "incorrectPredictions", label: "❌" },
  { key: "winRate", label: "📈" },
  { key: "auraPoints", label: "💠" },
  { key: "streak", label: "🔥" },
  { key: "total", label: "💰" }
];

const userStatsLeaderboardCommand = {
  async execute(interaction: any) {
    await databaseConnection();
    const UserStats = mongoose.model("UserStats", UserStatsSchema);

    await interaction.deferReply({ ephemeral: true });

    // sort leaderboard by total, winRate, correctPredictions, less totalPredictions
    const leaderboard = await UserStats.find({}).lean();
    leaderboard.sort((a, b) => {
      // 1. total (desc)
      if ((b.total ?? 0) !== (a.total ?? 0)) return (b.total ?? 0) - (a.total ?? 0);
      // 2. winRate (desc)
      if ((b.winRate ?? 0) !== (a.winRate ?? 0)) return (b.winRate ?? 0) - (a.winRate ?? 0);
      // 3. correctPredictions (desc)
      if ((b.correctPredictions ?? 0) !== (a.correctPredictions ?? 0)) return (b.correctPredictions ?? 0) - (a.correctPredictions ?? 0);
      // 4. totalPredictions (asc)
      return (a.totalPredictions ?? 0) - (b.totalPredictions ?? 0);
    });

    if (!leaderboard.length) {
      await interaction.editReply({ content: "​📂​ No hay datos de **User Stats** aún." });
      return;
    }

    const userMap: Record<string, string> = {};
    for (const row of leaderboard) {
      try {
        const member = await interaction.guild.members.fetch(row.userId);
        userMap[row.userId] = `@${member.displayName}`;
      } catch {
        userMap[row.userId] = `<@${row.userId}>`;
      }
    }

    // list
    let message = `🏆 **TABLA DE POSICIONES**\n`;
    leaderboard.forEach((row, idx) => {
      const username = userMap[row.userId];
      const total = row.total ?? 0.00;
      let totalFormateado = "";
      let statusEmoji = "🔸​";
      if (total > 0) {
        statusEmoji = "🔺";
        totalFormateado = `**+S/.${total.toFixed(2)}**`;
      } else if (total < 0) {
        statusEmoji = "🔻";
        totalFormateado = `-S/.${Math.abs(total).toFixed(2)}`;
      } else {
        statusEmoji = "🔸​";
        totalFormateado = `*S/.0.00*`;
      }
      if (idx === 0) statusEmoji = "👑";

      const USERNAME_WIDTH = 16;
      const paddedUsername = username.padEnd(USERNAME_WIDTH, ' ');
      const winRate = typeof row.winRate === "number" ? `${(row.winRate * 100).toFixed(2)}%` : "0.00%";
      message += `${idx + 1}. ${statusEmoji} **${paddedUsername}**   🎲 **${row.totalPredictions ?? 0}** = (✅ ​${row.correctPredictions ?? 0} / ⏹️ ​${row.noWinnersPredictions ?? 0} / ❌ ${row.incorrectPredictions ?? 0}) | ⭐ ${winRate} | 💠 ${row.auraPoints ?? 0} | 🔥 ${row.streak ?? 0} | 🪙​ ${totalFormateado}\n`;
    });

    // sent message to the channel
    if (interaction.channel && 'send' in interaction.channel && typeof interaction.channel.send === 'function') {
      await interaction.channel.send(message);
      await interaction.editReply({ content: "✅ Listado enviado al canal.", ephemeral: true });
    } else {
      await interaction.editReply({ content: "❌ No se pudo enviar el listado al canal.", ephemeral: true });
    }
  }
};

export default userStatsLeaderboardCommand;