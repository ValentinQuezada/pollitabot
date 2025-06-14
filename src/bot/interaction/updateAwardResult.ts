import { CommandInteraction } from "discord.js";
import databaseConnection from "../../database/connection";
import { checkRole } from "../events/interactionCreate";
import { mapTeamName } from "../../gen/client";

const updateAwardResultCommand = async (interaction: CommandInteraction) => {

  const hasRole = await checkRole(interaction, "ADMIN");
      
  if (!hasRole) {
    await interaction.reply({
      content: `⛔ No tienes permiso para usar este comando.`,
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const name = interaction.options.get('name')?.value as string;
  const result = interaction.options.get('result')?.value as string;

  const db = await databaseConnection();
  const Award = db.model("Award");

  const award = await Award.findOne({ name });
  if (!award) {
    await interaction.editReply({ content: "❌ Award no encontrada. Introduce el nombre exacto de la award."});
    return;
  }

  const response = await mapTeamName(result);
  if (!response.success) {
      await interaction.editReply({ content: "❌ Equipo no encontrado." });
      return;
  }
  console.log(response.data);

  award.result = response.data;
  await award.save();

  let message = `🏆 Resultado actualizado para **${award.name}**: ¡**${award.result}**!`;
  if (
    interaction.channel &&
    'send' in interaction.channel &&
    typeof interaction.channel.send === 'function'
  ) {
    await interaction.channel.send(message);
  }

  await interaction.editReply({ content: `✅ ¡Se guardó el resultado para la award **${award.name}** como **${award.result}**.`});
};

export default updateAwardResultCommand;
