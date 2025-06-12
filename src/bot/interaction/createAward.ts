import { CommandInteraction } from "discord.js";
import { createAward } from "../../database/controllers";

export const createAwardCommand = async (interaction: CommandInteraction) => {
  const name = interaction.options.get('name')?.value as string;

  await createAward({ name });

  await interaction.reply({
    content: 'Award created!',
    ephemeral: true
  });
};
