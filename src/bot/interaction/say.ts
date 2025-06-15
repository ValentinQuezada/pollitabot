import { CommandInteraction, GuildMember } from "discord.js";
import { GENERAL_CHANNEL_ID, OWNER_ID, REQUIRED_ROLE } from "../../constant/credentials";
import BOT_CLIENT from "../init";

const sayCommand = async (interaction: CommandInteraction) => {
  if (!interaction.guild) {
    await interaction.reply({
      content: '⛔ Este comando solo puede usarse en un servidor.',
      ephemeral: true
    });
    return;
  }

  // validate if the user is the owner or has the required role
  const member = interaction.member as GuildMember;
  const hasRole = member.roles.cache.some(role => role.name === REQUIRED_ROLE);

  if (!hasRole) {
    await interaction.reply({
      content: '⛔ No tienes permiso para usar este comando.',
      ephemeral: true
    });
    return;
  }

  const message = interaction.options.get('message')?.value as string;
  const channel = await BOT_CLIENT.channels.fetch(GENERAL_CHANNEL_ID);
  if (channel && 'send' in channel) {
    await channel.send(message);
  }
  await interaction.reply({
    content: `✅ ¡Mensaje enviado con éxito!`,
    ephemeral: true
  });
};

export default sayCommand;
