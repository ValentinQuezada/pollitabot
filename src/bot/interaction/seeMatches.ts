import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import { horaSimpleConHrs, diaSimple } from "../../utils/timestamp";

const seeMatches = async (interaction: CommandInteraction) => {
    await interaction.deferReply({ ephemeral: true });

    const db = await databaseConnection();
    const Match = db.model("Match");

    // search for all matches that are not finished
    let matchFilter: any = { isFinished: false };
    const matches = await Match.find(matchFilter);

    if (matches.length === 0) {
      await interaction.editReply({ content: "📂​ No hay partidos activos."});
      return;
    }

    let message = "🎲​ **Partidos activos:**\n";
    for (const match of matches) {
      message += `- **${diaSimple(match.datetime)}, ${horaSimpleConHrs(match.datetime)}:** ${match.team1} vs. ${match.team2}\n`;
    }

    await interaction.editReply({ content: message });
}

export default seeMatches;
