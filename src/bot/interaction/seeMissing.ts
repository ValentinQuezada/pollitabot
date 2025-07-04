import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import { horaSimpleConHrs } from "../../utils/timestamp";
import { getSupLabels } from "../../utils/sup";

const seeMissing = async (interaction: CommandInteraction) => {
    await interaction.deferReply({ ephemeral: true });

    const db = await databaseConnection();
    const Match = db.model("Match");
    const Prediction = db.model("Prediction", PredictionSchema);
    const UserStats = db.model("UserStats", UserStatsSchema);

    // search for user flag onlyGroupStage
    const userStats = await UserStats.findOne({ userId: interaction.user.id });
    const onlyGroupStage = userStats?.onlyGroupStage ?? true;

    // search for all matches that are not finished and have not started
    let matchFilter: any = { isFinished: false, hasStarted: false };
    if (onlyGroupStage) {
      matchFilter.matchType = "group-regular";
    }
    const matches = await Match.find(matchFilter);

    // search for all predictions of the user
    const predictions = await Prediction.find({ userId: interaction.user.id });
    const predictedMatchIds = new Set(predictions.map(p => p.matchId.toString()));

    // filter matches that the user has not predicted
    const missingMatches = matches.filter(m => !predictedMatchIds.has(m._id.toString()));

    if (missingMatches.length === 0) {
      await interaction.editReply({ content: "📂​ No tienes partidos pendientes por apostar."});
      return;
    }

    let message = "⌛️ **Partidos pendientes por apostar:**\n";
    for (const match of missingMatches) {
      const { sup } = getSupLabels(match.matchType);
      message += `- **${horaSimpleConHrs(match.datetime)}:** ${match.team1} vs ${match.team2}${sup}\n`;
    }

    await interaction.editReply({ content: message });
}

export default seeMissing;
