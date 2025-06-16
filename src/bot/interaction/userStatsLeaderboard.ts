import mongoose from "mongoose";
import { UserStatsSchema } from "../../schemas/user";
import databaseConnection from "../../database/connection";

const USER_STATS_ATTRS = [
  { key: "totalPredictions", label: "🎲", name: "Apuestas totales" },
  { key: "correctPredictions", label: "✅", name: "Apuestas ganadas" },
  { key: "noWinnersPredictions", label: "🟡", name: "Apuestas no winners" },
  { key: "incorrectPredictions", label: "❌", name: "Apuestas perdidas" },
  { key: "winRate", label: "📈", name: "Win Rate" },
  { key: "total", label: "💰", name: "Total" },
  { key: "auraPoints", label: "💠", name: "Aura points" },
  { key: "streak", label: "🔥", name: "Streak" }
];

const userStatsLeaderboardCommand = {
  async execute(interaction: any) {
    await databaseConnection();
    const UserStats = mongoose.model("UserStats", UserStatsSchema);

    // Ordena por total neto descendente
    const leaderboard = await UserStats.find({}).sort({ total: -1 }).lean();

    if (!leaderboard.length) {
      await interaction.reply({ content: "No hay datos de User Stats aún." });
      return;
    }

    // Tabla principal
    let message = `🏆 **Tabla de User Stats** 🏆\n\n`;
    // Cabecera
    message += `Pos | Usuario        | 🎲 | ✅ | 🟡 | ❌ | 📈    | 💰    | 💠 | 🔥\n`;
    message += `:--:|:--------------|:--:|:--:|:--:|:--:|:-----:|:-----:|:--:|:--:\n`;

    leaderboard.forEach((row, idx) => {
      const userTag = `<@${row.userId}>`.padEnd(14, " ");
      const total = row.total ?? 0;
      const totalStr = total >= 0 ? `✅ ${total}` : `❌ ${total}`;
      const winRate = typeof row.winRate === "number" ? `${(row.winRate * 100).toFixed(1)}%` : "0%";
      message += `${(idx + 1).toString().padEnd(3)}| ${userTag} | ${(row.totalPredictions ?? 0).toString().padEnd(2)} | ${(row.correctPredictions ?? 0).toString().padEnd(2)} | ${(row.noWinnersPredictions ?? 0).toString().padEnd(2)} | ${(row.incorrectPredictions ?? 0).toString().padEnd(2)} | ${winRate.padEnd(6)} | ${totalStr.padEnd(6)} | ${(row.auraPoints ?? 0).toString().padEnd(2)} | ${(row.streak ?? 0).toString().padEnd(2)}\n`;
    });

    // Envía la tabla como mensaje público al canal
    if (interaction.channel && 'send' in interaction.channel && typeof interaction.channel.send === 'function') {
      await interaction.channel.send("```markdown\n" + message + "```");
      await interaction.reply({ content: "Tabla enviada al canal.", ephemeral: true });
    } else {
      await interaction.reply({ content: "No se pudo enviar la tabla al canal.", ephemeral: true });
    }
  }
};

export default userStatsLeaderboardCommand;