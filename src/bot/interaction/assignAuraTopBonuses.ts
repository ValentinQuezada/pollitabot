import mongoose from "mongoose";
import { AuraPointsSchema } from "../../schemas/aura";
import { UserStatsSchema } from "../../schemas/user";
import { AURA_POINTS_VALUES } from "../../constant/auraPointsValues";
import { CommandInteraction } from "discord.js";
import { checkRole } from "../events/interactionCreate";

const assignAuraTopBonuses = async (interaction: CommandInteraction) => {
  const hasRole = await checkRole(interaction, "ADMIN");
  if(!hasRole) {
    await interaction.reply({
    content: `⛔ No tienes permiso para usar este comando.`,
    ephemeral: true
    });
    return;
}

  const db = await mongoose.connection;
  const AuraPoints = db.model("AuraPoints", AuraPointsSchema);
  const UserStats = db.model("UserStats", UserStatsSchema);

  // find all users to assign bonuses
  const users = await UserStats.find({});

  // calculate max values for top bonuses
  const maxProfit = Math.max(...users.map(u => u.total || 0));
  const maxWinRate = Math.max(...users.map(u => u.winRate || 0));
  const maxStreak = Math.max(...users.map(u => u.maxStreak || 0));

  // assign bonuses based on top values
  for (const user of users) {
    let aura = await AuraPoints.findOne({ userId: user.userId });
    if (!aura) {
      aura = new AuraPoints({ userId: user.userId });
    }

    // topProfit
    aura.topProfit = (user.total || 0) === maxProfit && maxProfit > 0 ? AURA_POINTS_VALUES.topProfit : 0;

    // topWinRate
    aura.topWinRate = (user.winRate || 0) === maxWinRate && maxWinRate > 0 ? AURA_POINTS_VALUES.topWinRate : 0;

    // topStreak
    aura.topStreak = (user.maxStreak || 0) === maxStreak && maxStreak > 0 ? AURA_POINTS_VALUES.topStreak : 0;

    // recalculate totalPoints
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
  }

  await interaction.reply({ content: "✅ Bonos de aura top asignados correctamente.", ephemeral: true });
};

export default assignAuraTopBonuses;