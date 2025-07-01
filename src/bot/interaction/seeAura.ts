import mongoose from "mongoose";
import { AuraPointsSchema } from "../../schemas/aura";
import databaseConnection from "../../database/connection";
import { ATTRIBUTES } from "../../constant/auraPointsValues";

const seeAuraCommand = {
  async execute(interaction: any) {
    await databaseConnection();
    const AuraPoints = mongoose.model("AuraPoints", AuraPointsSchema);

    // sorts the leaderboard by totalPoints in descending order
    const leaderboard = await AuraPoints.find({}).sort({ totalPoints: -1 }).lean();
    const userAura = leaderboard.find(row => row.userId === interaction.user.id) as any;
    if (userAura) {
      let privateMessage = `🔎 **Tus Aura Points (💠) por atributo:**\n`;
      ATTRIBUTES.forEach(attr => {
        if (attr.key !== "totalPoints") {
          privateMessage += `${attr.label} \`${attr.key}\`: **${userAura[attr.key] ?? 0}**\n`;
        }
      });
      privateMessage += `💠 **TOTALES: ${userAura.totalPoints}**`;
      await interaction.reply({ content: privateMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: "📂​ No hay datos de **Aura Points** aún." });
      return;
    }
  }
};

export default seeAuraCommand;