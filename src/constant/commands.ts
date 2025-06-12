import anonymousMessageCommand from "../commands/anon";
import createMatchCommand from "../commands/match";
import sayCommand from "../commands/say";
import sendMatchScorePredictionCommand from "../commands/scorePrediction";
import updateMatchScoreCommand from "../commands/updateScore";

const BOT_COMMANDS = [
    anonymousMessageCommand,
    sayCommand,
    createMatchCommand,
    sendMatchScorePredictionCommand,
    updateMatchScoreCommand
].map(command => command.toJSON());

export default BOT_COMMANDS;