import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { horaSimpleConHrs, diaSimple } from "../../utils/timestamp";
import { getSupLabels } from "../../utils/sup";

const seeMatches = async (interaction: CommandInteraction) => {
  await interaction.deferReply({ ephemeral: true });

  const db = await databaseConnection();
  const Match = db.model("Match");

  // search for all matches that are not finished
  let matchFilter: any = { isFinished: false };
  const matches = await Match.find(matchFilter);

  if (matches.length === 0) {
    await interaction.editReply({ content: "📂​ No hay partidos activos." });
    return;
  }

  let message = "🎲​ **Partidos activos:**\n";
  message += matches
    .map(match => {
      const { sup } = getSupLabels(match.matchType);
      let item = `- **${diaSimple(match.datetime)}, ${horaSimpleConHrs(match.datetime)}:** ${match.team1} vs. ${match.team2}${sup}`;
      
      return item;
    })
    .join("\n");

  await interaction.editReply({ content: message });
}

export default seeMatches;
