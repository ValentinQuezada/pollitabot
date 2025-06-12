import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";

export const updateMatchScoreCommand = async (interaction: CommandInteraction) => {
  const team1 = interaction.options.get('team1')?.value as string;
  const team2 = interaction.options.get('team2')?.value as string;
  const score1 = interaction.options.get('score1')?.value as number;
  const score2 = interaction.options.get('score2')?.value as number;
  const type = interaction.options.get('type')?.value as string;

  const db = await databaseConnection();
  const Match = db.model("Match");
  const Prediction = db.model("Prediction");

  const match = await Match.findOne({ team1, team2 });
  if (!match) {
    await interaction.reply({ content: "Match not found.", ephemeral: true });
    return;
  }

  match.score = { team1: score1, team2: score2 };
  await match.save();

  const predictions = await Prediction.find({ matchId: match._id });
  const winners = predictions.filter(p =>
    p.prediction.team1 === score1 && p.prediction.team2 === score2
  );

  if (type === 'partial' || type === 'final') {
    let message = type === 'partial'
      ? `¡⏸️ Medio tiempo! Resultado parcial: ${team1} ${score1} - ${score2} ${team2}\n`
      : `¡🏁 Tiempo completo! Resultado final: ${team1} ${score1} - ${score2} ${team2}\n`;

    const predictionsByScore: Record<string, string[]> = {};
    predictions.forEach(p => {
      const key = `${p.prediction.team1}-${p.prediction.team2}`;
      if (!predictionsByScore[key]) predictionsByScore[key] = [];
      predictionsByScore[key].push(`<@${p.userId}>`);
    });

    function getEmoji(pred: { team1: number; team2: number }): string {
      if (pred.team1 === score1 && pred.team2 === score2) return "✅";
      if (type === 'partial') {
        if (pred.team1 < score1 || pred.team2 < score2) return "❌";
        return "🟡";
      } else {
        return "❌";
      }
    }

    const sortedScores = Object.keys(predictionsByScore).sort((a, b) => {
      const [a1, a2] = a.split('-').map(Number);
      const [b1, b2] = b.split('-').map(Number);
      const totalA = a1 + a2;
      const totalB = b1 + b2;
      if (totalA !== totalB) return totalA - totalB;
      return a1 - b1;
    });

    for (const score of sortedScores) {
      const [pred1, pred2] = score.split('-').map(Number);
      const emoji = getEmoji({ team1: pred1, team2: pred2 });
      message += `- ${score}: ${predictionsByScore[score].join('/')} ${emoji}\n`;
    }

    if (winners.length > 0) {
      message += type === 'partial'
        ? `\nGanando por el momento: ${winners.map(p => `<@${p.userId}>`).join(', ')}`
        : `\nGanador(es): ${winners.map(p => `<@${p.userId}>`).join(', ')}`;
    } else {
      message += type === 'partial'
        ? `\nNadie ha atinado por ahora.`
        : `\nNadie atinó el resultado.`;
    }

    if (
      interaction.channel &&
      'send' in interaction.channel &&
      typeof interaction.channel.send === 'function'
    ) {
      await interaction.channel.send(message);
    }

    await interaction.reply({
      content: type === 'partial'
        ? "Partial result updated and announced."
        : "Final result updated, announced, and stats updated.",
      ephemeral: true
    });

    if (type === 'final') {
      match.isFinished = true;
      await match.save();
    }
  }
};
