import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";

const updateAwardResultCommand = async (interaction: CommandInteraction) => {

  await interaction.deferReply({ ephemeral: true });

  const name = interaction.options.get('name')?.value as string;
  const result = interaction.options.get('result')?.value as string;

  const db = await databaseConnection();
  const Award = db.model("Award");

  const award = await Award.findOne({ name });
  if (!award) {
    await interaction.reply({ content: "Award not found.", ephemeral: true });
    return;
  }

  award.result = result;
  await award.save();

  let message = `🏆 Award **${award.name}** resultado actualizado: **${award.result}**`;
  if (
    interaction.channel &&
    'send' in interaction.channel &&
    typeof interaction.channel.send === 'function'
  ) {
    await interaction.channel.send(message);
  }

  await interaction.reply({ content: "Award result updated!", ephemeral: true });
};

export default updateAwardResultCommand;
