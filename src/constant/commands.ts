import anonymousMessageCommand from "../commands/anon";
import createMatchCommand from "../commands/match";
import sayCommand from "../commands/say";
import sendMatchScorePredictionCommand from "../commands/scorePrediction";

const BOT_COMMANDS = [
    anonymousMessageCommand,
    sayCommand,
    createMatchCommand,
    sendMatchScorePredictionCommand
].map(command => command.toJSON());

export default BOT_COMMANDS;