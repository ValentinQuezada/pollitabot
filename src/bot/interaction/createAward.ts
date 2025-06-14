import { CommandInteraction } from "discord.js";
import { checkRole } from "../events/interactionCreate";
import { createAward } from "../../database/controllers";

const createAwardCommand = async (interaction: CommandInteraction) => {
  const hasRole = await checkRole(interaction, "ADMIN");
  
  if (!hasRole) {
    await interaction.reply({
      content: `⛔ No tienes permiso para usar este comando.`,
      ephemeral: true
    });
    return;
  }
  
  const name = interaction.options.get('name')?.value as string;

  await createAward({ name });

  await interaction.reply({
    content: `✅ ¡Award **${name}** creada con éxito!`,
    ephemeral: true
  });
  
};

export default createAwardCommand;
