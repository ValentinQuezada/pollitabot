import { set } from "mongoose";
import anonymousMessageCommand from "../commands/anon";
import createAwardCommand from "../commands/award";
import createMatchCommand from "../commands/match";
import sayCommand from "../commands/say";
import sendMatchScorePredictionCommand from "../commands/scorePrediction";
import updateAwardResultCommand from "../commands/updateAward";
import updateMatchScoreCommand from "../commands/updateScore";
import setGroupStageOnlyCommand from "../commands/setGroupStageOnly";

const BOT_COMMANDS = [
    anonymousMessageCommand,
    sayCommand,
    createMatchCommand,
    sendMatchScorePredictionCommand,
    updateMatchScoreCommand,
    createAwardCommand,
    updateAwardResultCommand,
    setGroupStageOnlyCommand
].map(command => command.toJSON());

export default BOT_COMMANDS;