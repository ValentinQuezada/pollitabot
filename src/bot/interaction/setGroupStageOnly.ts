import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { UserStatsSchema } from "../../schemas/user";

const setGroupStageOnlyCommand = async (interaction: CommandInteraction) => {
    await interaction.deferReply({ ephemeral: true });

    const onlyGroupStage = interaction.options.get('solo_grupos')?.value as boolean;

    // Limit June 28, 2025
    const deadlineLima = new Date(Date.UTC(2025, 5, 28, 5, 0, 0)); // 2025-06-28 00:00:00-05:00 = 2025-06-28 05:00:00 UTC
    const nowUTC = new Date();

    if (nowUTC >= deadlineLima) {
      await interaction.reply({
        content: "Ya no puedes cambiar esta opción. El plazo para elegir terminó.",
        ephemeral: true
      });
      return;
    }

    const db = await databaseConnection();
    const UserStats = db.model("UserStats", UserStatsSchema);

    await UserStats.updateOne(
      { userId: interaction.user.id },
      { $set: { onlyGroupStage } },
      { upsert: true }
    );

    await interaction.reply({
      content: onlyGroupStage
        ? "Has elegido **apostar solo en fase de grupos**. No estarás obligado a apostar en las siguientes fases."
        : "Has elegido **apostar en todas las fases**. ¡Recuerda que deberás apostar en todos los partidos fuera de grupos!",
      ephemeral: true
    });
};

export default setGroupStageOnlyCommand;