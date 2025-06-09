import { Client, IntentsBitField, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.DirectMessages
  ]
});

// Replace with your Discord user ID
const OWNER_ID = process.env.OWNER_ID!;

// Slash Commands
export const commands = [
  new SlashCommandBuilder()
    .setName('anonymous')
    .setDescription('Send an anonymous message to the owner')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Your anonymous message')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send a message through the bot (Owner only)')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send')
        .setRequired(true))
].map(command => command.toJSON());


client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('interactionCreate', async (interaction: CommandInteraction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'anonymous') {
    const message = interaction.options.get('message')?.value as string;
    
    // Send to owner's DMs
    const owner = await client.users.fetch(OWNER_ID);
    await owner.send(`Anonymous submission:\n${message}`);
    
    await interaction.reply({
      content: 'Your message has been sent anonymously!',
      ephemeral: true
    });
  }

  if (interaction.commandName === 'say') {
    if (interaction.user.id !== OWNER_ID) {
      await interaction.reply({
        content: 'You do not have permission for this command',
        ephemeral: true
      });
      return;
    }

    const message = interaction.options.get('message')?.value as string;
    await interaction.channel?.send(message);
    await interaction.reply({
      content: 'Message sent!',
      ephemeral: true
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
