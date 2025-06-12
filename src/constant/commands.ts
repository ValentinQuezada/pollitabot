import anonymousMessageCommand from "../commands/anon";
import createAwardCommand from "../commands/award";
import createMatchCommand from "../commands/match";
import sayCommand from "../commands/say";
import sendMatchScorePredictionCommand from "../commands/scorePrediction";
import updateAwardResultCommand from "../commands/updateAward";
import updateMatchScoreCommand from "../commands/updateScore";

const BOT_COMMANDS = [
    anonymousMessageCommand,
    sayCommand,
    createMatchCommand,
    sendMatchScorePredictionCommand,
    updateMatchScoreCommand,
    createAwardCommand,
    updateAwardResultCommand
].map(command => command.toJSON());

export default BOT_COMMANDS;