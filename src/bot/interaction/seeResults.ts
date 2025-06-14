import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";

const seeResultsCommand = async (interaction: CommandInteraction) => {
    await interaction.deferReply({ ephemeral: true });

    const db = await databaseConnection();
    const Prediction = db.model("Prediction", PredictionSchema);
    const Match = db.model("Match");

    // search for all predictions of the user
    const predictions = await Prediction.find({ userId: interaction.user.id });
    const matchIds = predictions.map(p => p.matchId);
    const matches = await Match.find({ _id: { $in: matchIds }, isFinished: false });

    if (matches.length === 0) {
      await interaction.reply({ content: "🆗​ No tienes predicciones pendientes.", ephemeral: true });
      return;
    }

    let message = "⌛️ Tus predicciones pendientes:\n";
    for (const match of matches) {
      const pred = predictions.find(p => p.matchId.toString() === match._id.toString());
      message += `- ${match.team1} vs ${match.team2}: ${pred?.prediction.team1}-${pred?.prediction.team2}\n`;
    }

    await interaction.reply({ content: message, ephemeral: true });
};

export default seeResultsCommand;