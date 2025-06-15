import { set } from "mongoose";
import anonymousMessageCommand from "../commands/anon";
import createAwardCommand from "../commands/award";
import createMatchCommand from "../commands/match";
import sayCommand from "../commands/say";
import sendMatchScorePredictionCommand from "../commands/scorePrediction";
import updateAwardResultCommand from "../commands/updateAward";
import updateMatchScoreCommand from "../commands/updateScore";
import setGroupStageOnlyCommand from "../commands/setGroupStageOnly";
import sendMissingCommand from "../commands/sendMissing";
import seeResultsCommand from "../commands/seeResults";
import sendMatchStatsCommand from "../commands/sendMatchStats";
import seeMissingCommand from "../commands/seeMissing";
import sendAwardPredictionCommand from "../commands/sendAwardPred";
import auraLeaderboardCommand from "../commands/auraLeaderboard";

const BOT_COMMANDS = [
    anonymousMessageCommand,
    sayCommand,
    createMatchCommand,
    sendMatchScorePredictionCommand,
    updateMatchScoreCommand,
    createAwardCommand,
    updateAwardResultCommand,
    setGroupStageOnlyCommand,
    sendMissingCommand,
    seeResultsCommand,
    sendMatchStatsCommand,
    seeMissingCommand,
    sendAwardPredictionCommand,
    auraLeaderboardCommand,
].map(command => command.toJSON());

export default BOT_COMMANDS;