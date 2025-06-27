import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import { checkRole } from "../events/interactionCreate";
import { horaSimpleConHrs } from "../../utils/timestamp";
import { mapTeamName } from "../../gen/client";

const sendMissingCommand = async (interaction: CommandInteraction) => {
    const hasRole = await checkRole(interaction, "ADMIN");
          
      if (!hasRole) {
        await interaction.reply({
          content: `⛔ No tienes permiso para usar este comando.`,
          ephemeral: true
        });
        return;
      }
    await interaction.deferReply({ ephemeral: true });

    let team1 = interaction.options.get('team1')?.value as string;
    let team2 = interaction.options.get('team2')?.value as string;

    const response1 = await mapTeamName(team1);
    if (!response1.success) {
        await interaction.editReply({ content: "❌ Equipo no encontrado." });
        return;
    }
    console.log(response1.data);

    const response2 = await mapTeamName(team2);
    if (!response2.success) {
        await interaction.editReply({ content: "❌ Equipo no encontrado." });
        return;
    }
    console.log(response2.data);

    team1 = response1.data.team;
    team2 = response2.data.team;

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

    let sup = "";
    if (
        match.matchType === "round-of-16-extra" ||
        match.matchType === "quarterfinal-extra" ||
        match.matchType === "semifinal-extra" ||
        match.matchType === "final-extra"
      ){
        sup += " (sup.)";
      }
    const mentionList = missingUsers.map(u => `<@${u.userId}>`).join(' ');
    const groupMessage = `*​🧿​ Estos jugadores aún no han enviado resultados para **${team1} vs. ${team2}${sup}** (${horaSimpleConHrs(match.datetime)}):* ${mentionList}`;

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
