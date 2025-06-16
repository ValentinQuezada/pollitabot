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

    // sort leaderboard by total
    const leaderboard = await UserStats.find({}).sort({ total: -1 }).lean();

    if (!leaderboard.length) {
      await interaction.editReply({ content: "No hay datos de User Stats aún." });
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
    let message = `🏆 **TABLA DE POSICIONES:**\n`;
    leaderboard.forEach((row, idx) => {
      const username = userMap[row.userId];
      const total = row.total ?? 0.00;
      let statusEmoji = "🔸​";
      if (total > 0) statusEmoji = "🔺";
      else if (total < 0) statusEmoji = "🔻";
      if (idx === 0) statusEmoji = "👑";

      const winRate = typeof row.winRate === "number" ? `${(row.winRate * 100).toFixed(1)}%` : "0.00%";
      message += `${idx + 1}. ${statusEmoji} ${username}\t| 🎲 ${row.totalPredictions ?? 0} | ✴️ ​${row.correctPredictions ?? 0} | ⏹️ ​${row.noWinnersPredictions ?? 0} | ❌ ${row.incorrectPredictions ?? 0} | ⭐ ${winRate} | 💠 ${row.auraPoints ?? 0} | 🔥 ${row.streak ?? 0} | 🪙​ ${total}\n`;
    });

    // sent message to the channel
    if (interaction.channel && 'send' in interaction.channel && typeof interaction.channel.send === 'function') {
      await interaction.channel.send(message);
      await interaction.editReply({ content: "Listado enviado al canal.", ephemeral: true });
    } else {
      await interaction.editReply({ content: "No se pudo enviar el listado al canal.", ephemeral: true });
    }
  }
};

export default userStatsLeaderboardCommand;