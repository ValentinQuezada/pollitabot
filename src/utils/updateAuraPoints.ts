import { AURA_POINTS_VALUES } from "../constant/auraPointsValues";
import { AuraPointsSchema } from "../schemas/aura";
import { UserStatsSchema } from "../schemas/user";
import { MatchMongoose } from "../schemas/match";
import mongoose from "mongoose";

export async function updateAuraPointsForMatch(matchId: string, winners: string[]) {
  const db = await mongoose.connection;
  const AuraPoints = db.model("AuraPoints", AuraPointsSchema);
  const UserStats = db.model("UserStats", UserStatsSchema);
  const Match = db.model("Match", MatchMongoose);

  const match = await Match.findById(matchId);
  if (!match) return;

  // find all users to update their aura points
  const users = await UserStats.find({});

  let maxProfit = Math.max(...users.map(u => u.total || 0));
  let maxWinRate = Math.max(...users.map(u => u.winRate || 0));
  let maxStreak = Math.max(...users.map(u => u.maxStreak || 0));

  for (const user of users) {
    let aura = await AuraPoints.findOne({ userId: user.userId });
    if (!aura) {
      aura = new AuraPoints({ userId: user.userId });
    }

    // matchesHit: correctPredictions * AURA_POINTS_VALUES.matchesHit
    aura.matchesHit = (user.correctPredictions || 0) * AURA_POINTS_VALUES.matchesHit;

    const streak = user.maxStreak || 0;
    aura.streak3plus += streak >= 3 ? (streak - 2) * AURA_POINTS_VALUES.streak3plus : 0;

    // topProfit
    aura.topProfit = (user.total || 0) === maxProfit && maxProfit > 0 ? AURA_POINTS_VALUES.topProfit : 0;

    // topWinRate
    aura.topWinRate = (user.winRate || 0) === maxWinRate && maxWinRate > 0 ? AURA_POINTS_VALUES.topWinRate : 0;

    // topStreak
    aura.topStreak = (user.maxStreak || 0) === maxStreak && maxStreak > 0 ? AURA_POINTS_VALUES.topStreak : 0;

    // specialHit, lateGoalHit, upsetHit: add points based on match properties
    if (winners.includes(user.userId)) {
      if (match.specialHit) {
        aura.specialHit += AURA_POINTS_VALUES.specialHit;
      }
      if (match.lateGoalHit) {
        aura.lateGoalHit += AURA_POINTS_VALUES.lateGoalHit;
      }
      if (match.upsetHit) {
        aura.upsetHit += AURA_POINTS_VALUES.upsetHit;
      }
      if (winners.length === 1) {
        aura.uniqueHit += AURA_POINTS_VALUES.uniqueHit;
      }
    }

    // totalPoints calculation
    aura.totalPoints =
      aura.matchesHit +
      aura.uniqueHit +
      aura.specialHit +
      aura.lateGoalHit +
      aura.upsetHit +
      aura.streak3plus +
      aura.topProfit +
      aura.topWinRate +
      aura.topStreak +
      aura.awardHit;

    await aura.save();

    // Update UserStats with aura points
    await UserStats.updateOne(
        { userId: user.userId },
        { $set: { auraPoints: aura.totalPoints } }
    );
    }
}
