import mongoose from "mongoose";
import { UserStatsSchema } from "../../schemas/user";
import databaseConnection from "../../database/connection";

const USER_STATS_ATTRS = [
  { key: "totalPredictions", label: "🎲" },
  { key: "correctPredictions", label: "✅" },
  { key: "incorrectPredictions", label: "❌" },
  { key: "noWinnersPredictions", label: "🟡" },
  { key: "streak", label: "🔥" },
  { key: "maxStreak", label: "🏅" },
  { key: "winRate", label: "📈" },
  { key: "loss", label: "🔻" },
  { key: "gain", label: "🟢" },
  { key: "total", label: "💰" }
];

const MAX_ROWS = 10;

const userStatsLeaderboardCommand = {
  async execute(interaction: any) {
    try {
      await databaseConnection();
      const UserStats = mongoose.model("UserStats", UserStatsSchema);

      await interaction.deferReply({ ephemeral: true });

      // sort by total net points
      const allUsers = await UserStats.find({}).sort({ total: -1 }).lean();
      if (!allUsers.length) {
        await interaction.editReply({ content: "No hay datos de User Stats aún." });
        return;
      }

      const leaderboard = allUsers.slice(0, MAX_ROWS);

      // build table header
      let message = `🏆 **Tabla de User Stats (Total Neto) - Top ${MAX_ROWS}** 🏆\n\n`;
      message += `Pos | Usuario `;
      USER_STATS_ATTRS.forEach(attr => {
        message += `| ${attr.label}`;
      });
      message += `\n`;

      message += `:--:|:-------:`;
      USER_STATS_ATTRS.forEach(() => {
        message += `|:---:`;
      });
      message += `\n`;

      // build table rows
      leaderboard.forEach((row, idx) => {
        message += `**${idx + 1}** | <@${row.userId}>`;
        USER_STATS_ATTRS.forEach(attr => {
          let value = (row as any)[attr.key];
          // format values
          if (attr.key === "winRate") {
            value = typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "0%";
          }
          message += ` | **${value ?? 0}**`;
        });
        message += `\n`;
      });

      if (allUsers.length > MAX_ROWS) {
        message += `\n_Mostrando solo los primeros ${MAX_ROWS} usuarios por total neto._`;
      }

      // top 3 users
      const winner = leaderboard[0];
      const second = leaderboard[1];
      const third = leaderboard[2];

      if (winner && second) {
        const diff = winner.total - second.total;
        message += `\n🥇 <@${winner.userId}> lidera la tabla por **${diff}** punto${diff === 1 ? '' : 's'}.`;
      }
      if (second) {
        message += `\n🥈 Luego le sigue <@${second.userId}> con **${second.total}** pts.`;
      }
      if (third) {
        message += `\n🥉 Y en tercer lugar <@${third.userId}> con **${third.total}** pts.`;
      }

      if (allUsers.length > 3) {
        const lastThree = allUsers.slice(-3);
        message += `\n\n😬 Los que se están hundiendo en la tabla:\n`;
        lastThree.forEach(row => {
          message += `- <@${row.userId}> (${row.total} pts)\n`;
        });
      }

      await interaction.editReply({ content: message });
    } catch (err) {
      console.error("Error en userStatsLeaderboardCommand:", err);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: "Ocurrió un error al mostrar la tabla." });
      } else {
        await interaction.reply({ content: "Ocurrió un error al mostrar la tabla.", ephemeral: true });
      }
    }
  }
};

export default userStatsLeaderboardCommand;