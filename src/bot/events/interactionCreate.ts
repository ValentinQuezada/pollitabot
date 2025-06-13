import { Interaction, CommandInteraction } from "discord.js";
import { GENERAL_CHANNEL_ID, OWNER_ID } from "../../constant/credentials";
import BOT_CLIENT from "../init";
import { convertToDateTime } from "../../utils/date";
import { createMatch, createAward, retrieveMatches, retrieveAwards} from "../../database/controllers";
import { linkMatchScore } from "../../gen/client";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import { MatchTypeEnum } from "../../schemas/match";
import { getMatchFee } from "../../utils/fee";
import { toNamespacedPath } from "path/win32";

const interactionCreateEvent = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;
  
  const commandInteraction = interaction as CommandInteraction;
  
  if (commandInteraction.commandName === 'anon') {
    const message = commandInteraction.options.get('message')?.value as string;
    const member = commandInteraction.member; 
    const displayName = (member && 'displayName' in member) 
      ? member.displayName 
      : interaction.user.username;


    const owner = await BOT_CLIENT.users.fetch(OWNER_ID);
    await owner.send(`Secret message from ${displayName}:\n${message}`);
    
    const generalChannel = await BOT_CLIENT.channels.fetch(GENERAL_CHANNEL_ID);
    if (generalChannel && 'send' in generalChannel) {
      await generalChannel.send(`${displayName} said something!`);
    }

    await interaction.reply({
      content: 'Your message has been sent secretly to the owner!',
      ephemeral: true
    });
  }

  if (interaction.commandName === 'say') {
    if (interaction.user.id !== OWNER_ID) {
      await interaction.reply({
        content: 'You do not have permission for this command',
        ephemeral: true
      });
      return;
    }

    const message = interaction.options.get('message')?.value as string;
    const channel = await BOT_CLIENT.channels.fetch(GENERAL_CHANNEL_ID);
    if (channel && 'send' in channel) {
      await channel.send(message);
    }
    await interaction.reply({
      content: 'Message sent!',
      ephemeral: true
    });
  }

  if (interaction.commandName === 'create-match') {
    // if (interaction.user.id !== OWNER_ID) {
    //   await interaction.reply({
    //     content: 'You do not have permission for this command',
    //     ephemeral: true
    //   });
    //   return;
    // }
    const team1 = interaction.options.get('team1')?.value as string;
    const team2 = interaction.options.get('team2')?.value as string;
    const datetime = interaction.options.get('datetime')?.value as string;
    const group = interaction.options.get('group')?.value as string;
    const matchType = interaction.options.get('matchtype')?.value as MatchTypeEnum;

    if (!datetime || typeof datetime !== "string" || !datetime.includes(" ")) {
      await interaction.reply({
        content: "Debes ingresar una fecha y hora válida en el formato YYYY-MM-DD HH:mm.",
        ephemeral: true
      });
      return;
    }

    function limaToUTC(dateString: string) {
      const [date, time] = dateString.split(" ");
      const [year, month, day] = date.split("-").map(Number);
      const [hour, minute] = time.split(":").map(Number);
      // create a Date object in UTC
      return new Date(Date.UTC(year, month - 1, day, hour + 5, minute));
    }

    await createMatch({
      team1,
      team2,
      datetime: limaToUTC(datetime),
      group,
      matchType,
      isFinished: false,
      hasStarted: false
    });

    await interaction.reply({
      content: 'Match created!',
      ephemeral: true
    });
  }

  if (interaction.commandName === 'update-match-score') {
    const team1 = interaction.options.get('team1')?.value as string;
    const team2 = interaction.options.get('team2')?.value as string;
    const score1 = interaction.options.get('score1')?.value as number;
    const score2 = interaction.options.get('score2')?.value as number;
    const type = interaction.options.get('type')?.value as string;

    const db = await databaseConnection();
    const Match = db.model("Match");
    const Prediction = db.model("Prediction");
    const UserStats = db.model("UserStats");

    const match = await Match.findOne({ team1, team2, hasStarted: true, isFinished: false });
    if (!match) {
      await interaction.reply({ content: "Match not found.", ephemeral: true });
      return;
    }

    match.score = { team1: score1, team2: score2 };
    await match.save();

    // get all predictions for this match
    const predictions = await Prediction.find({ matchId: match._id });
    const winners = predictions.filter(p =>
      p.prediction.team1 === score1 && p.prediction.team2 === score2
    );

    if (type === 'partial' || type === 'final') {
      let message = type === 'partial'
        ? `¡⏸️ Medio tiempo! Resultado parcial: ${team1} ${score1} - ${score2} ${team2}\n`
        : `¡🏁 Tiempo completo! Resultado final: ${team1} ${score1} - ${score2} ${team2}\n`;

      // group predictions by score
      const predictionsByScore: Record<string, string[]> = {};
      predictions.forEach(p => {
        const key = `${p.prediction.team1}-${p.prediction.team2}`;
        if (!predictionsByScore[key]) predictionsByScore[key] = [];
        predictionsByScore[key].push(`<@${p.userId}>`);
      });

      // determine the emoji for each prediction
      function getEmoji(pred: { team1: number; team2: number }): string {
        if (pred.team1 === score1 && pred.team2 === score2) return "✅";
        if (type === 'partial') {
          // impossble
          if (pred.team1 < score1 || pred.team2 < score2) return "❌";
          return "🟡";
        } else {
          // only for final
          return "❌";
        }
      }

      // sort predictions by score
      const sortedScores = Object.keys(predictionsByScore).sort((a, b) => {
        const [a1, a2] = a.split('-').map(Number);
        const [b1, b2] = b.split('-').map(Number);
        const totalA = a1 + a2;
        const totalB = b1 + b2;
        if (totalA !== totalB) return totalA - totalB;
        return a1 - b1;
      });

      // list predictions by score
      for (const score of sortedScores) {
        const [pred1, pred2] = score.split('-').map(Number);
        const emoji = getEmoji({ team1: pred1, team2: pred2 });
        message += `- ${score}: ${predictionsByScore[score].join('/')} ${emoji}\n`;
      }

      // winners
      if (winners.length > 0) {
        message += type === 'partial'
          ? `\nGanando por el momento: ${winners.map(p => `<@${p.userId}>`).join(', ')}`
          : `\nGanador(es): ${winners.map(p => `<@${p.userId}>`).join(', ')}`;
      } else {
        message += type === 'partial'
          ? `\nNadie ha atinado por ahora.`
          : `\nNadie atinó el resultado.`;
      }

      if (
        interaction.channel &&
        'send' in interaction.channel &&
        typeof interaction.channel.send === 'function'
      ) {
        await interaction.channel.send(message);
      }

      await interaction.reply({
        content: type === 'partial'
          ? "Partial result updated and announced."
          : "Final result updated, announced, and stats updated.",
        ephemeral: true
      });

      // if final, update user stats
      if (type === 'final') {
        match.isFinished = true;
        await match.save();

        // get all predictions for this match
        const predictions = await Prediction.find({ matchId: match._id });
        const winners = predictions.filter(p =>
          p.prediction.team1 === score1 && p.prediction.team2 === score2
        );
        const winnerIds = new Set(winners.map(w => w.userId));
        const allUserIds = predictions.map(p => p.userId);

        const matchFee = getMatchFee(match.matchType);

        // calculate the pool and gain per winner
        const pool = allUserIds.length * matchFee;
        const gainPerWinner = winners.length > 0 ? pool / winners.length : 0;

        // for each prediction, update user stats
        for (const prediction of predictions) {
          const userId = prediction.userId;
          const isWinner = winnerIds.has(userId);

          const userStats = await UserStats.findOne({ userId }) || new UserStats({ userId });

          // update user stats
          // userStats.totalPredictions = (userStats.totalPredictions || 0) + 1;

          if (isWinner) {
            userStats.correctPredictions = (userStats.correctPredictions || 0) + 1;
            userStats.streak = (userStats.streak || 0) + 1;
            userStats.gain = (userStats.gain || 0) + gainPerWinner;
            userStats.total = (userStats.total || 0) + gainPerWinner; // add gain
            userStats
          } else {
            // if no winners, increment noWinnersPredictions
            if (winners.length === 0) {
              userStats.noWinnersPredictions = (userStats.noWinnersPredictions || 0) + 1;
              userStats.loss = (userStats.loss || 0) + matchFee; // no gain, but no loss either
              userStats.total = (userStats.total || 0) + matchFee; // deduct match fee
              // streak remains the same
            } else {
              userStats.incorrectPredictions = (userStats.incorrectPredictions || 0) + 1;
              userStats.streak = 0;
            }
          }

          await userStats.save();
        }
      }
    }
  }

 if (interaction.commandName === 'create-award') {
    // if (interaction.user.id !== OWNER_ID) {
    //   await interaction.reply({
    //     content: 'You do not have permission for this command',
    //     ephemeral: true
    //   });
    //   return;
    // }
    const name = interaction.options.get('name')?.value as string;

    await createAward({name});

    await interaction.reply({
      content: 'Award created!',
      ephemeral: true
    });
  }

  if (interaction.commandName === 'update-award-result') {
    const name = interaction.options.get('name')?.value as string;
    const result = interaction.options.get('result')?.value as string;

    const db = await databaseConnection();
    const Award = db.model("Award");

    // find the award by name
    const award = await Award.findOne({ name });
    if (!award) {
      await interaction.reply({ content: "Award not found.", ephemeral: true });
      return;
    }

    // update the result
    award.result = result;
    await award.save();

    let message = `🏆 Award **${award.name}** resultado actualizado: **${award.result}**`;
    if (
      interaction.channel &&
      'send' in interaction.channel &&
      typeof interaction.channel.send === 'function'
    ) {
      await interaction.channel.send(message);
    }

    await interaction.reply({ content: "Award result updated!", ephemeral: true });
  }

  if (interaction.commandName === 'send-match-stats') {
    const team1 = interaction.options.get('team1')?.value as string;
    const team2 = interaction.options.get('team2')?.value as string;

    const db = await databaseConnection();
    const Match = db.model("Match");
    const Prediction = db.model("Prediction", PredictionSchema);
    const UserStats = db.model("UserStats", UserStatsSchema);

    // search for the match that is not finished and has not started
    const match = await Match.findOne({ team1, team2, isFinished: false, hasStarted: false });
    if (!match) {
      await interaction.reply({ content: "No se encontró el partido pendiente.", ephemeral: true });
      return;
    }

    // search for all predictions and users
    const predictions = await Prediction.find({ matchId: match._id });
    const users = await UserStats.find({});
    const relevantUsers = match.matchType === "group-regular"
      ? users
      : users.filter(u => u.onlyGroupStage === false);

    // missing users
    const predictedUserIds = new Set(predictions.map(p => p.userId));
    const missingUsers = relevantUsers.filter(u => !predictedUserIds.has(u.userId));

    // calculate scores
    const scoresA = predictions.map(p => p.prediction.team1 ?? 0).sort((a, b) => a - b);
    const scoresB = predictions.map(p => p.prediction.team2 ?? 0).sort((a, b) => a - b);

    // mean
    const meanA = scoresA.length ? (scoresA.reduce((a, b) => a + b, 0) / scoresA.length) : 0;
    const meanB = scoresB.length ? (scoresB.reduce((a, b) => a + b, 0) / scoresB.length) : 0;

    // median
    function median(arr: number[]) {
      if (!arr.length) return 0;
      const mid = Math.floor(arr.length / 2);
      return arr.length % 2 === 1
        ? arr[mid]
        : (arr[mid - 1] + arr[mid]) / 2;
    }
    const medianA = median(scoresA);
    const medianB = median(scoresB);

    let message = `📊 **Estadísticas de apuestas para ${team1} vs ${team2}**\n`;
    message += `- Jugadores que faltan apostar: ${missingUsers.length} (${missingUsers.map(u => `<@${u.userId}>`).join(' ') || 'Ninguno'})\n`;
    message += `- Total de apuestas: ${predictions.length}\n`;
    message += `- Media de score: ${meanA.toFixed(2)}-${meanB.toFixed(2)}\n`;
    message += `- Mediana de score: ${medianA}-${medianB}\n`;

    if (
      interaction.channel &&
      'send' in interaction.channel &&
      typeof interaction.channel.send === 'function'
    ) {
      await interaction.channel.send(message);
    }

    await interaction.reply({ content: "Estadísticas enviadas al canal.", ephemeral: true });
  }

  if (interaction.commandName === 'see-missing') {
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
      await interaction.reply({ content: "No tienes partidos pendientes por apostar.", ephemeral: true });
      return;
    }

    let message = "Partidos pendientes por apostar:\n";
    for (const match of missingMatches) {
      message += `- ${match.team1} vs ${match.team2}\n`;
    }

    await interaction.reply({ content: message, ephemeral: true });
  }

  if (interaction.commandName === 'send-score-prediction') {
    await interaction.deferReply({ ephemeral: true });

    try {
      const predictionText = interaction.options.get('prediction')?.value as string;
      const matches = await retrieveMatches();
      console.log('Matches retrieved:', matches);

      const response = await linkMatchScore(
        predictionText,
        matches.map(match => match.team1 + " vs " + match.team2)
      );
      if (!response.success) {
        await interaction.editReply({ content: response.error });
        return;
      }

      const match = matches.find(
        m => m.team1 === response.data.team1 && m.team2 === response.data.team2 && m.hasStarted === false
      );
      if (!match) {
        await interaction.editReply({ content: "No se encontró el partido para la predicción." });
        return;
      }
      console.log(match.datetime, new Date());

      if (new Date() >= match.datetime) {
        await interaction.editReply({ content: "Ya no puedes apostar, el partido ya empezó." });
        return;
      }

      const db = await databaseConnection();
      const Prediction = db.model("Prediction", PredictionSchema);

      let existingPrediction = await Prediction.findOne({
        userId: interaction.user.id,
        matchId: match._id
      });

      let actionMessage;
      if (existingPrediction) {
        existingPrediction.prediction = response.data.score;
        await existingPrediction.save();
        actionMessage = `*¡<@${interaction.user.id}> ha actualizado sus resultados para ${match.team1} vs ${match.team2}!*`;
      } else {
        await Prediction.create({
          userId: interaction.user.id,
          matchId: match._id,
          prediction: response.data.score
        });
        actionMessage = `*¡<@${interaction.user.id}> ha enviado sus resultados para ${match.team1} vs ${match.team2}!*`;

        const matchFee = getMatchFee(match.matchType);
        const UserStats = db.model("UserStats", UserStatsSchema);
        await UserStats.updateOne(
          { userId: interaction.user.id },
          {
            $inc: {
              totalPredictions: 1,
              loss: -matchFee,
              total: -matchFee
            }
          },
          { upsert: true }
        );
      }

      if (
        interaction.channel &&
        'send' in interaction.channel &&
        typeof interaction.channel.send === 'function'
      ) {
        await interaction.channel.send(actionMessage);
      }

      await interaction.editReply({ content: '¡Predicción guardada!' });
    } catch (error) {
      console.error('Error in send-score-prediction:', error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: 'Ocurrió un error al procesar tu predicción.' });
      } else {
        await interaction.reply({ content: 'Ocurrió un error al procesar tu predicción.', ephemeral: true });
      }
    }
  }

  if (interaction.commandName === 'see-results') {
    const db = await databaseConnection();
    const Prediction = db.model("Prediction", PredictionSchema);
    const Match = db.model("Match");

    // search for all predictions of the user
    const predictions = await Prediction.find({ userId: interaction.user.id });
    const matchIds = predictions.map(p => p.matchId);
    const matches = await Match.find({ _id: { $in: matchIds }, isFinished: false });

    if (matches.length === 0) {
      await interaction.reply({ content: "No tienes predicciones pendientes.", ephemeral: true });
      return;
    }

    let message = "Tus predicciones pendientes:\n";
    for (const match of matches) {
      const pred = predictions.find(p => p.matchId.toString() === match._id.toString());
      message += `- ${match.team1} vs ${match.team2}: ${pred?.prediction.team1}-${pred?.prediction.team2}\n`;
    }

    await interaction.reply({ content: message, ephemeral: true });
  }


  if (interaction.commandName === 'send-missing') {
    const team1 = interaction.options.get('team1')?.value as string;
    const team2 = interaction.options.get('team2')?.value as string;

    const db = await databaseConnection();
    const Match = db.model("Match");
    const Prediction = db.model("Prediction", PredictionSchema);
    const UserStats = db.model("UserStats", UserStatsSchema);

    // search for the match that is not finished and has not started
    const match = await Match.findOne({ team1, team2, isFinished: false, hasStarted: false });
    if (!match) {
      await interaction.reply({ content: "No se encontró el partido pendiente.", ephemeral: true });
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
      await interaction.reply({ content: "Todos los jugadores ya enviaron predicción para este partido.", ephemeral: true });
      return;
    }

    const mentionList = missingUsers.map(u => `<@${u.userId}>`).join(' ');
    const groupMessage = `Estos jugadores aún no han mandado resultados para ${team1} vs ${team2}: ${mentionList}`;

    if (
      interaction.channel &&
      'send' in interaction.channel &&
      typeof interaction.channel.send === 'function'
    ) {
      await interaction.channel.send(groupMessage);
    }

    await interaction.reply({ content: "Mensaje enviado al grupo.", ephemeral: true });
  }

  if (interaction.commandName === 'set-group-stage-only') {
    const onlyGroupStage = interaction.options.get('solo_grupos')?.value as boolean;

    // Limit June 28, 2025
    const deadlineLima = new Date(Date.UTC(2025, 5, 28, 5, 0, 0)); // 2025-06-28 00:00:00-05:00 = 2025-06-28 05:00:00 UTC
    const nowUTC = new Date();

    if (nowUTC >= deadlineLima) {
      await interaction.reply({
        content: "Ya no puedes cambiar esta opción. El plazo para elegir terminó.",
        ephemeral: true
      });
      return;
    }

    const db = await databaseConnection();
    const UserStats = db.model("UserStats", UserStatsSchema);

    await UserStats.updateOne(
      { userId: interaction.user.id },
      { $set: { onlyGroupStage } },
      { upsert: true }
    );

    await interaction.reply({
      content: onlyGroupStage
        ? "Has elegido **apostar solo en fase de grupos**. No estarás obligado a apostar en las siguientes fases."
        : "Has elegido **apostar en todas las fases**. ¡Recuerda que deberás apostar en todos los partidos fuera de grupos!",
      ephemeral: true
    });
  }
};

export default interactionCreateEvent;
