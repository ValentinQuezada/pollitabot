import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";

const sendMatchStats = async (interaction: CommandInteraction) => {
    await interaction.deferReply({ ephemeral: true });

    const team1 = interaction.options.get('team1')?.value as string;
    const team2 = interaction.options.get('team2')?.value as string;

    const db = await databaseConnection();
    const Match = db.model("Match");
    const Prediction = db.model("Prediction", PredictionSchema);
    const UserStats = db.model("UserStats", UserStatsSchema);

    // search for the match that is not finished and has not started
    const match = await Match.findOne({ team1, team2, isFinished: false, hasStarted: false });
    if (!match) {
        await interaction.reply({ content: "No se encontró el partido pendiente.", ephemeral: true });
        return;
    }

    // search for all predictions and users
    const predictions = await Prediction.find({ matchId: match._id });
    const users = await UserStats.find({});
    const relevantUsers = match.matchType === "group-regular"
        ? users
        : users.filter(u => u.onlyGroupStage === false);

    // missing users
    const predictedUserIds = new Set(predictions.map(p => p.userId));
    const missingUsers = relevantUsers.filter(u => !predictedUserIds.has(u.userId));

    // calculate scores
    const scoresA = predictions.map(p => p.prediction.team1 ?? 0).sort((a, b) => a - b);
    const scoresB = predictions.map(p => p.prediction.team2 ?? 0).sort((a, b) => a - b);

    // mean
    const meanA = scoresA.length ? (scoresA.reduce((a, b) => a + b, 0) / scoresA.length) : 0;
    const meanB = scoresB.length ? (scoresB.reduce((a, b) => a + b, 0) / scoresB.length) : 0;

    // median
    function median(arr: number[]) {
        if (!arr.length) return 0;
        const mid = Math.floor(arr.length / 2);
        return arr.length % 2 === 1
            ? arr[mid]
            : (arr[mid - 1] + arr[mid]) / 2;
    }
    const medianA = median(scoresA);
    const medianB = median(scoresB);

    let message = `📊 ***Estadísticas pre-partido** para ${team1} vs ${team2}*:\n`;
    message += `- **Jugadores que faltan apostar:** ${missingUsers.length} (${missingUsers.map(u => `<@${u.userId}>`).join(' ') || 'Ninguno'})\n`;
    message += `- **Total de apuestas:** ${predictions.length}\n`;
    message += `- **Media de score:** ${meanA.toFixed(2)}-${meanB.toFixed(2)}\n`;
    message += `- **Mediana de score:** ${medianA}-${medianB}\n`;

    if (
        interaction.channel &&
        'send' in interaction.channel &&
        typeof interaction.channel.send === 'function'
    ) {
        await interaction.channel.send(message);
    }

    await interaction.reply({ content: "Estadísticas enviadas al canal.", ephemeral: true });
}

export default sendMatchStats;
