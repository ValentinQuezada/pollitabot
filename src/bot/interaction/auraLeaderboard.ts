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
  { key: "totalPoints", label: "🧮" }
];

const auraLeaderboardCommand = {
  async execute(interaction: any) {
    await databaseConnection();
    const AuraPoints = mongoose.model("AuraPoints", AuraPointsSchema);

    // sorts the leaderboard by totalPoints in descending order
    const leaderboard = await AuraPoints.find({}).sort({ totalPoints: -1 }).lean();

    if (!leaderboard.length) {
      await interaction.editReply({ content: "No hay datos de Aura Points aún." });
      return;
    }

    // build the leaderboard table header
    let message = `🏆 **Tabla de Aura Points** 🏆\n\n`;
    message += `Pos | Usuario | Puntos\n`;
    message += `:--:|:-------:|:------:\n`;
    leaderboard.forEach((row, idx) => {
      message += `**${idx + 1}** | <@${row.userId}> | **${row.totalPoints}**\n`;
    });

    // top 3 and last 3
    const winner = leaderboard[0];
    const second = leaderboard[1];
    const third = leaderboard[2];

    if (winner && second) {
      const diff = winner.totalPoints - second.totalPoints;
      message += `\n🥇 <@${winner.userId}> lidera la tabla por **${diff}** punto${diff === 1 ? '' : 's'}.`;
    }
    if (second) {
      message += `\n🥈 Luego le sigue <@${second.userId}> con **${second.totalPoints}** pts.`;
    }
    if (third) {
      message += `\n🥉 Y en tercer lugar <@${third.userId}> con **${third.totalPoints}** pts.`;
    }

    if (leaderboard.length > 3) {
      const lastThree = leaderboard.slice(-3);
      message += `\n\n😬 Los que se están hundiendo en la tabla:\n`;
      lastThree.forEach(row => {
        message += `- <@${row.userId}> (${row.totalPoints} pts)\n`;
      });
    }

    // show the user's own breakdown if present
    const userAura = leaderboard.find(row => row.userId === interaction.user.id) as any;
    if (userAura) {
    message += `\n\n🔎 **Tus Aura Points por atributo:**\n`;
    ATTRIBUTES.forEach(attr => {
        if (attr.key !== "totalPoints") {
        message += `${attr.label} \`${attr.key}\`: **${userAura[attr.key] ?? 0}**\n`;
        }
    });
    message += `🧮 \`totalPoints\`: **${userAura.totalPoints}**`;
    }

    await interaction.reply({ content: message });
  }
};

export default auraLeaderboardCommand;