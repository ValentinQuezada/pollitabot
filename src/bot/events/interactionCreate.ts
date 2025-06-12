import { Interaction, CommandInteraction } from "discord.js";
import { GENERAL_CHANNEL_ID, OWNER_ID } from "../../constant/credentials";
import BOT_CLIENT from "../init";
import { convertToDateTime } from "../../utils/date";
import { createMatch, retrieveMatches } from "../../database/controllers";
import { linkMatchScore } from "../../gen/client";
import databaseConnection from "../../database/connection";
import { PredictionSchema } from "../../schemas/prediction";
import { UserStatsSchema } from "../../schemas/user";
import { MatchTypeEnum } from "../../schemas/match";

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

    await createMatch({
      team1,
      team2,
      datetime: convertToDateTime(datetime),
      group,
      matchType,
      isFinished: false
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

    const match = await Match.findOne({ team1, team2 });
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

    if (type === 'partial') {
      let message = `¡⏸️ Medio tiempo! Resultado parcial: ${team1} ${score1} - ${score2} ${team2}\n`;
      if (winners.length > 0) {
        message += `Ganando por el momento: ${winners.map(p => `<@${p.userId}>`).join(', ')}`;
      } else {
        message += `Nadie ha atinado por ahora.`;
      }
      if (
        interaction.channel &&
        'send' in interaction.channel &&
        typeof interaction.channel.send === 'function'
      ) {
        await interaction.channel.send(message);
      }
      await interaction.reply({ content: "Partial result updated and announced.", ephemeral: true });
    }

    if (type === 'final') {
      let message = `¡🏁 Tiempo completo! Resultado final: ${team1} ${score1} - ${score2} ${team2}\n`;
      if (winners.length > 0) {
        message += `Ganador(es): ${winners.map(p => `<@${p.userId}>`).join(', ')}`;
      } else {
        message += `Nadie atinó el resultado.`;
      }
      if (
        interaction.channel &&
        'send' in interaction.channel &&
        typeof interaction.channel.send === 'function'
      ) {
        await interaction.channel.send(message);
      }
      await interaction.reply({ content: "Final result updated, announced, and stats updated.", ephemeral: true });
    }
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
        m => m.team1 === response.data.team1 && m.team2 === response.data.team2
      );
      if (!match) {
        await interaction.editReply({ content: "No se encontró el partido para la predicción." });
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
      }

      if (
        interaction.channel &&
        'send' in interaction.channel &&
        typeof interaction.channel.send === 'function'
      ) {
        await interaction.channel.send(actionMessage);
      }

      const UserStats = db.model("UserStats", UserStatsSchema);
      await UserStats.updateOne(
        { userId: interaction.user.id },
        {
          $inc: {
            totalPredictions: 1,
            loss: -5,
            total: -5
          }
        },
        { upsert: true }
      );

      await interaction.editReply({ content: '¡Predicción guardada!' });
    } catch (error) {
      console.error('Error in send-score-prediction:', error);
      await interaction.editReply({ content: 'Ocurrió un error al procesar tu predicción.' });
    }
  }
};

export default interactionCreateEvent;
