import { CommandInteraction, GuildMember } from "discord.js";
import { GENERAL_CHANNEL_ID, OWNER_ID, REQUIRED_ROLE } from "../../constant/credentials";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import { CreateMatchType, MatchDocument } from "../../schemas/match";
import { MatchMongoose } from "../../schemas/match";
import { horaSimpleConHrs, diaSimple } from "../../utils/timestamp";
import { getSupLabels } from "../../utils/sup";
import { retrieveMatches } from "../../database/controllers";
import { linkMatch } from "../../gen/client";
import { markerToDuple } from "../../utils/matchers";

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
      matches = matches.filter(match => 
        match._id.toString() === response.data._id.toString()
      );
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
      const { sup } = getSupLabels(match.matchType);
      
      if(rev){
        message += `***${match.team1} vs. ${match.team2}${sup}** (${diaSimple(match.datetime)}, ${horaSimpleConHrs(match.datetime)})*\n`
        const predictions = await Prediction.find({ matchId: match._id });

        // group predictions by score
        const predictionsByScore: Record<string, string[]> = {};
        predictions.forEach(p => {
          let key: string;
          if(p.prediction.team1 != p.prediction.team2){
            key = `${p.prediction.team1}-${p.prediction.team2}`;
          } else {
            switch (p.prediction.advances) {
              case 'team1':
                key = `${p.prediction.team1}>${p.prediction.team2}`;
                break;
              case 'team2':
                key = `${p.prediction.team2}<${p.prediction.team1}`;
                break;
              default:
                key = `${p.prediction.team1}-${p.prediction.team2}`;
            }
          }
          if (!predictionsByScore[key]) predictionsByScore[key] = [];
          predictionsByScore[key].push(`<@${p.userId}>`);
        });

        // sort predictions by score
        const sortedKeys = Object.keys(predictionsByScore).sort((a, b) => {
          const [a1, a2] = markerToDuple(a);
          const [b1, b2] = markerToDuple(b);
          const totalA = a1 + a2;
          const totalB = b1 + b2;
          if (totalA != totalB) return totalB - totalA;
          return b1 - a1;
        });

        // message with predictions
        let predictionsMsg = "";
        for (const key of sortedKeys) {
        predictionsMsg += `${key}: ${predictionsByScore[key].join("/")}\n`;
        }

        message += predictionsMsg + "\n";
      } else {
        message += `- **${diaSimple(match.datetime)}, ${horaSimpleConHrs(match.datetime)}:** ${match.team1} vs. ${match.team2}${sup}\n`;
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
