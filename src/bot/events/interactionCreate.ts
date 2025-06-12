import { CommandInteraction, Interaction } from "discord.js";
import {
  anonCommand,
  createAwardCommand,
  createMatchCommand,
  sayCommand,
  sendScorePredictionCommand,
  updateAwardResultCommand,
  updateMatchScoreCommand
} from "../interaction";

const interactionCreateEvent = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;
  
  const commandInteraction = interaction as CommandInteraction;
  
  switch (commandInteraction.commandName) {
    case 'anon':
      await anonCommand(commandInteraction);
      break;
    case 'say':
      await sayCommand(commandInteraction);
      break;
    case 'create-match':
      await createMatchCommand(commandInteraction);
      break;
    case 'update-match-score':
      await updateMatchScoreCommand(commandInteraction);
      break;
    case 'create-award':
      await createAwardCommand(commandInteraction);
      break;
    case 'update-award-result':
      await updateAwardResultCommand(commandInteraction);
      break;
    case 'send-score-prediction':
      await sendScorePredictionCommand(commandInteraction);
      break;
  }
};

export default interactionCreateEvent;
