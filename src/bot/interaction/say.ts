import { CommandInteraction } from "discord.js";
import { GENERAL_CHANNEL_ID, OWNER_ID } from "../../constant/credentials";
import BOT_CLIENT from "../init";

const sayCommand = async (interaction: CommandInteraction) => {
  if (interaction.user.id !== OWNER_ID) {
    await interaction.reply({
      content: 'You do not have permission for this command',
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
    content: 'Message sent!',
    ephemeral: true
  });
};

export default sayCommand;
