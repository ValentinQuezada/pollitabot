import { CommandInteraction } from "discord.js";
import { GENERAL_CHANNEL_ID, OWNER_ID } from "../../constant/credentials";
import BOT_CLIENT from "../init";

export const anonCommand = async (interaction: CommandInteraction) => {
  const message = interaction.options.get('message')?.value as string;
  const member = interaction.member;
  const displayName = (member && 'displayName' in member)
    ? member.displayName
    : interaction.user.username;

  const owner = await BOT_CLIENT.users.fetch(OWNER_ID);
  await owner.send(`Secret message from ${displayName}:\n${message}`);
  
  const generalChannel = await BOT_CLIENT.channels.fetch(GENERAL_CHANNEL_ID);
  if (generalChannel && 'send' in generalChannel) {
    await generalChannel.send(`${displayName} said something!`);
  }

  await interaction.reply({
    content: 'Your message has been sent secretly to the owner!',
    ephemeral: true
  });
};
