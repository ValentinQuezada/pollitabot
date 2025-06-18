import { CommandInteraction } from "discord.js";
import mongoose from "mongoose";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import { MatchMongoose } from "../../schemas/match";
import { AuraPointsSchema } from "../../schemas/aura";

const Prediction = mongoose.model("Prediction", PredictionSchema);
const UserStats = mongoose.model("UserStats", UserStatsSchema);
const Match = mongoose.model("Match", MatchMongoose);
const AuraPoints = mongoose.model("AuraPoints", AuraPointsSchema);

const dailySummary = async (interaction: CommandInteraction) => {
  const fecha = interaction.options.get('fecha')?.value as string | undefined;
  let date = new Date();
  if (fecha) {
    // YYYY-MM-DD
    const [year, month, day] = fecha.split('-').map(Number);
    date = new Date(year, month - 1, day);
  }
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  // search for matches finished on that day
  const matches = await Match.find({
    isFinished: true,
    datetime: { $gte: start, $lte: end }
  });

  if (!matches.length) {
    await interaction.reply({ content: "No hay partidos finalizados para ese día.", ephemeral: true });
    return;
  }

  let message = `🌎 POLLITA FIFA CWC 2025\nResumen: Día ${start.getDate()}\n\n`;

  // profit and aura points
  const profitMap: Record<string, number> = {};
  const auraMap: Record<string, number> = {};

  for (const match of matches) {
    const predictions = await Prediction.find({ matchId: match._id });

    message += `${match.team1} vs. ${match.team2}\n`;
    if (match.score && typeof match.score.team1 === "number" && typeof match.score.team2 === "number") {
      message += `Resultado final: (${match.score.team1} - ${match.score.team2})\n`;
    } else {
      message += `Resultado final: (sin registrar)\n`;
    }

    // group predictions by score
    const predGroups: Record<string, string[]> = {};
    for (const p of predictions) {
      const key = `${p.prediction.team1}-${p.prediction.team2}`;
      if (!predGroups[key]) predGroups[key] = [];
      predGroups[key].push(p.userId);
    }

    // process predictions
    for (const [score, userIds] of Object.entries(predGroups)) {
      const [pred1, pred2] = score.split('-');
      const isCorrect = match.score && Number(pred1) === match.score.team1 && Number(pred2) === match.score.team2;
      const emoji = isCorrect ? "✅" : "❌";
      const profit = isCorrect ? match.fee * userIds.length * 2 : -match.fee;
      const aura = isCorrect ? match.fee : 0;

      // Nombres de usuario
      const names = await Promise.all(userIds.map(async uid => {
        try {
          const member = await interaction.guild?.members.fetch(uid);
          return member?.displayName || `User${uid}`;
        } catch {
          return `User${uid}`;
        }
      }));

      // Suma profit y aura
      userIds.forEach(uid => {
        profitMap[uid] = (profitMap[uid] || 0) + (isCorrect ? profit : -match.fee);
        auraMap[uid] = (auraMap[uid] || 0) + (isCorrect ? aura : 0);
      });

      message += `- ${score}: ${names.join('/')} ${emoji} (${isCorrect ? `+${profit}` : profit})${isCorrect && aura ? ` (+${aura} 💠)` : ""}\n`;
    }
    message += `\n`;
  }

  // Profit obtenido
  message += `🪙 Profit obtenido:\n`;
  const profitArr = Object.entries(profitMap).sort((a, b) => b[1] - a[1]);
  for (const [uid, profit] of profitArr) {
    const emoji = profit > 0 ? "🔺" : "🔻";
    const member = await interaction.guild?.members.fetch(uid).catch(() => null);
    const name = member?.displayName || `User${uid}`;
    message += `${emoji} ${name} ${profit > 0 ? "+" : ""}${profit}\n`;
  }

  // Aura points obtenidos
  message += `\n💠 Aura Points obtenidos:\n`;
  const auraArr = Object.entries(auraMap).filter(([, a]) => a > 0).sort((a, b) => b[1] - a[1]);
  for (const [uid, aura] of auraArr) {
    const member = await interaction.guild?.members.fetch(uid).catch(() => null);
    const name = member?.displayName || `User${uid}`;
    message += `${name} +${aura} 💠\n`;
  }

  await interaction.reply({ content: message.length > 2000 ? message.slice(0, 1990) + "..." : message });
};

export default dailySummary;