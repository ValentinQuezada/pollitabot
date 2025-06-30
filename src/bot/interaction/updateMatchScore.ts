import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { MatchMongoose, MatchTypeEnum } from "../../schemas/match";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import { checkRole } from "../events/interactionCreate";
import { updateAuraPointsForMatch } from "../../utils/updateAuraPoints";
import BOT_CLIENT from "../init";
import { GENERAL_CHANNEL_ID } from "../../constant/credentials";
import { mapTeamName } from "../../gen/client";
import { createMatch } from "../../database/controllers";
import { addMinutes } from 'date-fns';
import { toZonedTime, format } from 'date-fns-tz';
import { getSupLabels, isExtraTime } from "../../utils/sup";
import { markerToDuple } from "../../utils/matchers";

const timeZone = 'America/Lima';

function getTimeIn10Minutes(): Date {
  const now = new Date();
  const futureTimeUTC = addMinutes(now, 10);
  return futureTimeUTC;
}

function formatDateToString(dateObject: Date): string {
  const formatString = 'MMM d yyyy HH:mm:ss';
  return format(dateObject, formatString);
}

const updateMatchScoreCommand = async (interaction: CommandInteraction) => {
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
  const score1 = interaction.options.get('score1')?.value as number;
  const score2 = interaction.options.get('score2')?.value as number;
  const advances = interaction.options.get('advances')?.value as string;
  const type = interaction.options.get('type')?.value as string;

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

  // flags
  const specialHit = interaction.options.get('specialhit')?.value as boolean;
  const lateGoalHit = interaction.options.get('lategoalhit')?.value as boolean;
  const upsetHit = interaction.options.get('upsethit')?.value as boolean;

  const db = await databaseConnection();
  const Match = db.model("Match", MatchMongoose);
  const Prediction = db.model("Prediction", PredictionSchema);
  const UserStats = db.model("UserStats", UserStatsSchema);

  const match = await Match.findOne({ team1, team2, hasStarted: true, isFinished: false });
  if (!match) {
    await interaction.editReply({ content: "Match not found." });
    return;
  }

  // update match score
  match.score = { team1: score1, team2: score2 };

  // only update flags if type is 'final'
  if (type === 'final') {
    match.specialHit = specialHit;
    match.lateGoalHit = lateGoalHit;
    match.upsetHit = upsetHit;
    match.isFinished = true;
  }

  await match.save();

  const { sup, SUPLE } = getSupLabels(match.matchType);

  // get all predictions for this match
  const predictions = await Prediction.find({ matchId: match._id });
  const winners = predictions.filter(p =>
    p.prediction.team1 === score1 && p.prediction.team2 === score2 && (p.prediction.advances ? p.prediction.advances === advances : true)
  );
  const losers = predictions.filter(p =>
    p.prediction.team1 != score1 || p.prediction.team2 != score2 || (p.prediction.advances ? p.prediction.advances != advances : false)
  );
  const winnerIds = new Set(winners.map(w => w.userId));
  const allUserIds = predictions.map(p => p.userId);

  // nonBettors are users who did not bet on this match
  const nonGroupStageUsers = await UserStats.find({ onlyGroupStage: false });
  const userIdsWithPrediction = predictions.map(p => p.userId);
  const nonBettors = nonGroupStageUsers
  .filter(u => !userIdsWithPrediction.includes(u.userId))
  .map(u => u.userId);

  const matchFee = match.fee;

  // calculate the pool and gain per winner
  let pool: number;
  if (match.matchType !== "group-regular") {
    // out of group stage matches
    const bettorsCount = allUserIds.length;
    const nonBettorsCount = nonBettors.length;
    pool = (bettorsCount * matchFee) + (nonBettorsCount * (matchFee / 2));
  } else {
    // group stage matches
    pool = allUserIds.length * matchFee;
  }
  const gainPerWinner = winners.length > 0 ? pool / winners.length - matchFee: 0;

  let res: string;
  switch (advances) {
    case 'team1':
      res = `${score1} > ${score2}`;
      break;
    case 'team2':
      res = `${score1} < ${score2}`;
      break;
    default:
      res = `${score1} - ${score2}`;
  }

  if (type === 'partial' || type === 'final') {
    let message = type === 'partial'
      ? `⏸️ **¡MEDIO TIEMPO${SUPLE}!**\n***${team1} vs. ${team2}${sup}***\n**Resultado parcial: (${res})**\n`
      : `🏁 **¡TIEMPO${SUPLE} COMPLETO!**\n***${team1} vs. ${team2}${sup}***\n**Resultado final: (${res})**\n`;

    // group predictions by score
    const predictionsByScore: Record<string, string[]> = {};
    predictions.forEach(p => {
      let key: string;
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
      if (!predictionsByScore[key]) predictionsByScore[key] = [];
      predictionsByScore[key].push(`<@${p.userId}>`);
    });

    // determine the emoji for each prediction
    function getEmoji(pred: { team1: number; team2: number; diferenciador: string }): string {
      let key : string;
      switch (pred.diferenciador) {
        case '>':
          key = 'team1';
          break;
        case '<':
          key = 'team2';
          break;
        default:
          key = '';
      }
      if (type === 'partial') {
        if (pred.team1 === score1 && pred.team2 === score2) return "❇️";
        if (pred.team1 < score1 || pred.team2 < score2) return "❌";
        return "⏺️​";
      } else {
        if (winners.length > 0){
          if (pred.team1 === score1 && pred.team2 === score2
            && (advances ? key === advances : true)) return "✅​​";
          return "❌";
        } else {
          return "⏹️";
        }
      }
    }

    // sort predictions by score
    const sortedScores = Object.keys(predictionsByScore).sort((a, b) => {
      const [a1, a2] = markerToDuple(a);
      const [b1, b2] = markerToDuple(b);
      const totalA = a1 + a2;
      const totalB = b1 + b2;
      if (totalA != totalB) return totalB - totalA;
      return b1 - a1;
    });

    // list predictions by score
    for (const score of sortedScores) {
      const [, pred1Str, diferenciador, pred2Str,] = score.match(/(\d+)([-><])(\d+)/) ?? [];
      const pred1 = Number(pred1Str);
      const pred2 = Number(pred2Str);
      const emoji = getEmoji({ team1: pred1, team2: pred2, diferenciador });
      message += `${score}: ${predictionsByScore[score].join('/')} ${emoji}\n`;
    }

    // non-bettors
    message += `❌: ${nonBettors.map(uid => `<@${uid}>`).join("/")}\n`

    // winners
    if (winners.length > 0) {
      message += type === 'partial'
        ? `\n❇️​ *Ganador(es) por ahora:* ${winners.map(p => `<@${p.userId}>`).join(', ')}`
        : `\n✅​​ ***¡Bravo!** Ganador(es):* ${winners.map(p => `<@${p.userId}>`).join(', ')}`;
    } else {
      message += type === 'partial'
        ? `\n⏺️​ *Nadie ha atinado por ahora.*`
        : `\n⏹️​ ***¡No Winner!** Nadie atinó el resultado.*`;
    }

    if (
        interaction.channel &&
        'send' in interaction.channel &&
        typeof interaction.channel.send === 'function'
    ) {
        await interaction.channel.send(message);
    }

    await interaction.editReply({
      content: type === 'partial'
        ? "✅ Resultado parcial anunciado."
        : "✅ Resultado final anunciado, stats actualizados."
    });

    // if final, update user stats
    if (type === 'final') {
      match.isFinished = true;
      await match.save();

      // const prediction = await Prediction.findOne({ userId: user.userId, matchId: match._id });
      if (
        (match.matchType === "round-of-16-extra" ||
          match.matchType === "quarterfinal-extra" ||
          match.matchType === "semifinal-extra" ||
          match.matchType === "final-extra") &&
        Array.isArray((match as any).allowedToBet)
      ) {
        const allowedToBet: string[] = (match as any).allowedToBet;
        const userIdsWithPrediction = predictions.map(p => p.userId);
        const nonBettors = allowedToBet.filter(uid => !userIdsWithPrediction.includes(uid));

        for (const userId of nonBettors) {
          const userStats = await UserStats.findOne({ userId }) || new UserStats({ userId });
          userStats.missedNonGroupPredictions = (userStats.missedNonGroupPredictions || 0) + 1;
          if (winners.length > 0) {
            userStats.streak = 0; // reset streak if user did not bet
            userStats.loss = (userStats.loss || 0) - match.fee / 2; // loss half the fee
            userStats.total = (userStats.gain || 0) + (userStats.loss || 0);
          }
          await userStats.save();
        }
      }
      else if (match.matchType !== "group-regular") {
        // users who did not bet on this match
        for (const userId of nonBettors) {
          const userStats = await UserStats.findOne({ userId }) || new UserStats({ userId });
          userStats.missedNonGroupPredictions = (userStats.missedNonGroupPredictions || 0) + 1;
          if(winners.length > 0) {
            userStats.streak = 0; // reset streak if user did not bet
            userStats.loss = (userStats.loss || 0) - matchFee / 2;
            userStats.total = userStats.gain + userStats.loss;
          }
          await userStats.save();
        }
      }


      // for each prediction, update user stats
      for (const prediction of predictions) {
        const userId = prediction.userId;
        const isWinner = winnerIds.has(userId);

        const userStats = await UserStats.findOne({ userId }) || new UserStats({ userId });

        // update user stats
        userStats.totalPredictions = (userStats.totalPredictions || 0) + 1;

        if (isWinner) {
          userStats.correctPredictions = (userStats.correctPredictions || 0) + 1;
          userStats.streak = (userStats.streak || 0) + 1;
          userStats.gain = (userStats.gain || 0) + gainPerWinner;
          
          //update max streak if current streak is greater
          if ((userStats.streak || 0) > (userStats.maxStreak || 0)) {
            userStats.maxStreak = userStats.streak;
          }
        } else {
          // if no winners, increment noWinnersPredictions
          if (winners.length === 0) {
            userStats.noWinnersPredictions = (userStats.noWinnersPredictions || 0) + 1;
            // streak remains the same
          } else {
            userStats.incorrectPredictions = (userStats.incorrectPredictions || 0) + 1;
            userStats.loss = (userStats.loss || 0) - matchFee;
            userStats.streak = 0;
          }
        }
        userStats.total = userStats.gain + userStats.loss;

        // calculate win rate
        const correct = userStats.correctPredictions || 0;
        const total = userStats.totalPredictions || 0;
        userStats.winRate = total > 0 ? correct / total : 0;

        await userStats.save();
      }

      if(winners.length != 0){
        const winners_id = predictions
        .filter(p => p.prediction.team1 === score1 && p.prediction.team2 === score2)
        .map(p => p.userId);

        // send winner message
        let winnerMsg = `**${winners.map(p => `<@${p.userId}>`).join('/')} (+${gainPerWinner})**\n vs. ${losers.map(p => `<@${p.userId}>`).join('/')} (-${matchFee})`

        if (
            interaction.channel &&
            'send' in interaction.channel &&
            typeof interaction.channel.send === 'function'
        ) {
            await interaction.channel.send(winnerMsg);
        }

        // save aura points before updating
        const AuraPoints = db.model("AuraPoints", require("../../schemas/aura").AuraPointsSchema);
        const beforeAura = await AuraPoints.find({ userId: { $in: winners_id } }).lean();
        const beforeAuraMap: Record<string, number> = {};
        beforeAura.forEach(a => { beforeAuraMap[a.userId] = a.totalPoints || 0; });


        // update aura points for winners
        await updateAuraPointsForMatch(match._id.toString(), winners_id);

        // calculate aura points difference
        const afterAura = await AuraPoints.find({ userId: { $in: winners_id } }).lean();
        const auraDiffs = afterAura.map(a => ({
          userId: a.userId,
          diff: (a.totalPoints || 0) - (beforeAuraMap[a.userId] || 0),
          total: a.totalPoints || 0
        }));

        // sort by difference
        auraDiffs.sort((a, b) => b.diff - a.diff);

        // message for aura points
        let auraMsg = "💠 ***Aura Points** ganados:*\n";
        auraDiffs.forEach((a, idx) => {
          auraMsg += `• <@${a.userId}> ganó +**${a.diff}** 💠 (total: ${a.total})\n`;
        }); //${idx + 1}. 

        // send aura points message
        if (interaction.channel && 'send' in interaction.channel && typeof interaction.channel.send === 'function') {
          await interaction.channel.send(auraMsg);
        }

        //update prediction status
        for (const pred of winners){
          pred.isWinner = true;
          auraDiffs.forEach((a, idx) => {
            if(a.userId === pred.userId) {pred.auraGiven = a.diff};
          });
        }

      }

      // create new match if extra time
      if((match.matchType === "round-of-16-regular"
        || match.matchType === "quarterfinal-regular"
        || match.matchType === "semifinal-regular"
        || match.matchType === "final-regular")
        && match.score.team1 === match.score.team2){
          const nonGroupUsers = (await UserStats.find({ onlyGroupStage: false })).map(u => u.userId);
          const allowedUserIds = predictions
            .filter(p => nonGroupUsers.includes(p.userId))
            .map(p => p.userId);
          const newtype = match.matchType.replace("-regular", "-extra") as MatchTypeEnum;
          const newMatch = {
            team1: match.team1,
            team2: match.team2,
            datetime: getTimeIn10Minutes(),
            group: match.group,
            matchType: newtype,
            fee: winners.length === 0 ? match.fee : match.fee / 2,
            isFinished: false,
            hasStarted: false,
            specialHit: false,
            lateGoalHit: false,
            upsetHit: false,
            statsAnnounced: false,
            allowedToBet: allowedUserIds
          }
          await createMatch(newMatch);
          
          const announceMsg = `📢 ***¡Tiempo suplementario creado!**\n**${team1} vs. ${team2}**\n🕒 Empieza en **10 minutos** (${formatDateToString(toZonedTime(newMatch.datetime, timeZone))}, hora Perú)\nEnvía tu predicción con* \`/send-score-prediction\`.`;
        
          // send announcement to the general channel
          try {
            const channel = await BOT_CLIENT.channels.fetch(GENERAL_CHANNEL_ID);
            if (channel && 'send' in channel) {
              await channel.send(announceMsg);
            }
          } catch (e) {
            console.error("Error al enviar el mensaje al canal general:", e);
            await interaction.editReply({
              content: "❌ No se pudo enviar el mensaje de anuncio al canal general."
            });
            return;
          }
        
          await interaction.editReply({
            content: `✅​ ¡Partido **${team1} vs. ${team2}** creado con éxito!`
          });
        }

    }
  }
};

export default updateMatchScoreCommand;