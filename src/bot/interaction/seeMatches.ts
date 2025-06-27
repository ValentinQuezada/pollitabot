import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { horaSimpleConHrs, diaSimple } from "../../utils/timestamp";

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
      let item = `- **${diaSimple(match.datetime)}, ${horaSimpleConHrs(match.datetime)}:** ${match.team1} vs. ${match.team2}`;
      if (
        match.matchType === "round-of-16-extra" ||
        match.matchType === "quarterfinal-extra" ||
        match.matchType === "semifinal-extra" ||
        match.matchType === "final-extra"
      ) {
        item += " (sup.)";
      }
      return item;
    })
    .join("\n");

  await interaction.editReply({ content: message });
}

export default seeMatches;
