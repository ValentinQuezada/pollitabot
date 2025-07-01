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
import userStatsLeaderboardCommand from "../commands/userStatsLeaderboard";
import sendMatchOtherPredictionCommand from "../commands/otherPrediction";
import seeMatchesCommand from "../commands/seeMatches";
import sendMatchesCommand from "../commands/sendMatches";
import assignAuraTopBonusesCommand from "../commands/assignAuraTopBonuses";
// import dailySummaryCommand from "../commands/dailySummary";
import groupStageStatusCommand from "../commands/groupStageStatus";
import seeAuraCommand from "../commands/seeAura";

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
    seeMatchesCommand,
    sendMatchesCommand,
    sendAwardPredictionCommand,
    auraLeaderboardCommand,
    userStatsLeaderboardCommand,
    sendMatchOtherPredictionCommand,
    assignAuraTopBonusesCommand,
    groupStageStatusCommand,
    seeAuraCommand
    // dailySummaryCommand
].map(command => command.toJSON());

export default BOT_COMMANDS;