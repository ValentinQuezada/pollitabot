import { CommandInteraction, Interaction } from "discord.js";
import {
  anonCommand,
  createAwardCommand,
  createMatchCommand,
  sayCommand,
  seeMissingCommand,
  seeResultsCommand,
  sendMatchStatsCommand,
  sendMissingCommand,
  sendScorePredictionCommand,
  setGroupStageOnlyCommand,
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
    case 'see-results':
      await seeResultsCommand(commandInteraction);
      break;
    case 'send-missing':
      await sendMissingCommand(commandInteraction);
      break;
    case 'set-group-stage-only':
      await setGroupStageOnlyCommand(commandInteraction);
      break;
    case 'send-match-stats':
      await sendMatchStatsCommand(commandInteraction);
      break;
    case 'see-missing':
      await seeMissingCommand(commandInteraction);
      break;
  }
};

export default interactionCreateEvent;
