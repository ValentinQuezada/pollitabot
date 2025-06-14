import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";

const sendMissingCommand = async (interaction: CommandInteraction) => {
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
      await interaction.editReply({ content: "❌ No se encontró el partido pendiente."});
      return;
    }

    // search for all users
    let users = await UserStats.find({});
    // if the match is not a group stage match, filter users who have only group stage predictions
    if (match.matchType !== "group-regular") {
      users = users.filter(u => u.onlyGroupStage === false);
    }

    // search for all predictions for this match
    const predictions = await Prediction.find({ matchId: match._id });
    const predictedUserIds = new Set(predictions.map(p => p.userId));

    // filter users who have not sent a prediction
    const missingUsers = users.filter(u => !predictedUserIds.has(u.userId));
    if (missingUsers.length === 0) {
      await interaction.editReply({ content: "☑️​ **Todos los jugadores** enviaron predicción para este partido."});
      return;
    }

    const mentionList = missingUsers.map(u => `<@${u.userId}>`).join(' ');
    const groupMessage = `*🔘 Estos jugadores aún no han mandado resultados para **${team1} vs ${team2}**:* ${mentionList}.`;

    if (
      interaction.channel &&
      'send' in interaction.channel &&
      typeof interaction.channel.send === 'function'
    ) {
      await interaction.channel.send(groupMessage);
    }

    await interaction.editReply({ content: "​✅​ Mensaje enviado al grupo."});
};

export default sendMissingCommand;
