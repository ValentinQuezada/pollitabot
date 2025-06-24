import { CommandInteraction, GuildMember } from "discord.js";
import { GENERAL_CHANNEL_ID, OWNER_ID, REQUIRED_ROLE } from "../../constant/credentials";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import { CreateMatchType, MatchDocument } from "../../schemas/match";
import { MatchMongoose } from "../../schemas/match";
import { horaSimpleConHrs, diaSimple } from "../../utils/timestamp";
import { retrieveMatches } from "../../database/controllers";
import { linkMatch } from "../../gen/client";

const sendMatches = async (interaction: CommandInteraction) => {
    await interaction.deferReply({ ephemeral: true });

    // validate if the user is the owner or has the required role
    const member = interaction.member as GuildMember;
    const hasRole = member.roles.cache.some(role => role.name === REQUIRED_ROLE);
  
    if (!hasRole) {
      await interaction.reply({
        content: '⛔ No tienes permiso para usar este comando.',
        ephemeral: true
      });
      return;
    }

    const rev = interaction.options.get('revelar')?.value as boolean;
    const par = interaction.options.get('partido')?.value as string;
    const db = await databaseConnection();
    const Match = db.model("Match");
    const Prediction = db.model("Prediction", PredictionSchema);

    let matches = await retrieveMatches();

    if(par){
      const response = await linkMatch(
          par,
          matches
      );
      if (!response.success) {
          await interaction.editReply({ content: response.error });
          return;
      }
      console.log(response.data);
      matches = await db.model<MatchDocument>("Match", MatchMongoose)
        .find({isFinished: false})
        .select(response.data)
        .limit(1)
        .sort({datetime: 1})
    }

    if (matches.length === 0) {
      await interaction.editReply({ content: "📂​ No hay partidos activos."});
      return;
    }

    let message = "🎲​ **Partidos activos:**\n";
    if(rev){message += "*(incluyendo resultados)*\n\n"};

    if (
        interaction.channel &&
        'send' in interaction.channel &&
        typeof interaction.channel.send === 'function'
    ) {
        await interaction.channel.send(message);
    }

    for (const match of matches) {
      let message = ""
      if(rev){
        message += `***${match.team1} vs. ${match.team2}** (${diaSimple(match.datetime)}, ${horaSimpleConHrs(match.datetime)})*\n`
        const predictions = await Prediction.find({ matchId: match._id });

        // group predictions by team1-team2
        const grouped: Record<string, string[]> = {};
        for (const pred of predictions) {
        const key = `${pred.prediction.team1}-${pred.prediction.team2}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(`<@${pred.userId}>`);
        }

        // sort keys by team1-team2 in descending order
        const sortedKeys = Object.keys(grouped).sort((a, b) => {
          const [a1, a2] = a.split('-').map(Number);
          const [b1, b2] = b.split('-').map(Number);
          const totalA = a1 + a2;
          const totalB = b1 + b2;
          if (totalA != totalB) return totalB - totalA;
          return b1 - a1;
        });

        // message with predictions
        let predictionsMsg = "";
        for (const key of sortedKeys) {
        predictionsMsg += `${key}: ${grouped[key].join("/")}\n`;
        }

        message += predictionsMsg + "\n";
      } else {
        message += `- **${diaSimple(match.datetime)}, ${horaSimpleConHrs(match.datetime)}:** ${match.team1} vs. ${match.team2}\n`;
      }

      if (
          interaction.channel &&
          'send' in interaction.channel &&
          typeof interaction.channel.send === 'function'
      ) {
          await interaction.channel.send(message);
      }

    }

    await interaction.editReply({ content: "✅ Partidos enviados al canal."});
}

export default sendMatches;
