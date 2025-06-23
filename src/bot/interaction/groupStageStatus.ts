import { CommandInteraction } from "discord.js";
import mongoose from "mongoose";
import { UserStatsSchema } from "../../schemas/user";

const groupStageStatus = async (interaction: CommandInteraction) => {
  const UserStats = mongoose.model("UserStats", UserStatsSchema);

  await interaction.deferReply({ ephemeral: true });

  const users = await UserStats.find({});

  const continúan = users.filter(u => u.onlyGroupStage === false);
  const noContinúan = users.filter(u => u.onlyGroupStage !== false);

  let message = `**Jugadores que continúan después de la fase de grupos:**\n`;
  if (continúan.length) {
    message += continúan.map(u => `<@${u.userId}>`).join(', ') + "\n";
  } else {
    message += "_Ninguno_\n";
  }

  message += `\n**Jugadores que NO continúan:**\n`;
  if (noContinúan.length) {
    message += noContinúan.map(u => `<@${u.userId}>`).join(', ');
  } else {
    message += "_Ninguno_";
  }

  await interaction.editReply({ content: message });
};

export default groupStageStatus;