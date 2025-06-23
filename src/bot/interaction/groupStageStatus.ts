import { CommandInteraction } from "discord.js";
import mongoose from "mongoose";
import { UserStatsSchema } from "../../schemas/user";
import databaseConnection from "../../database/connection";

const groupStageStatus = async (interaction: CommandInteraction) => {
  await databaseConnection();  
  const UserStats = mongoose.model("UserStats", UserStatsSchema);

  await interaction.deferReply({ ephemeral: true });

  const users = await UserStats.find({});

  const stay = users.filter(u => u.onlyGroupStage === false);
  const doNotStay = users.filter(u => u.onlyGroupStage !== false);

  let message = `**Jugadores que continúan después de la fase de grupos:**\n`;
  if (stay.length) {
    message += stay.map(u => `<@${u.userId}>`).join(', ') + "\n";
  } else {
    message += "_Ninguno_\n";
  }

  message += `\n**Jugadores que NO continúan:**\n`;
  if (doNotStay.length) {
    message += doNotStay.map(u => `<@${u.userId}>`).join(', ');
  } else {
    message += "_Ninguno_";
  }

  await interaction.editReply({ content: message });
};

export default groupStageStatus;