import { Client, IntentsBitField, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import * as dotenv from 'dotenv';
import { createMatch } from './database';

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
const GENERAL_CHANNEL_ID  = process.env.GENERAL_CHANNEL_ID!;

// Slash Commands
export const commands = [
  new SlashCommandBuilder()
    .setName('anon')
    .setDescription('Send a secret message to the owner')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Your secret message')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send a message through the bot (Owner only)')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('create-match')
    .setDescription('Create a match to post results in a channel')
    .addStringOption(option =>
      option.setName('team1')
        .setDescription('Team 1 Name')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('team2')
        .setDescription('Team 2 Name')
        .setRequired(true))
].map(command => command.toJSON());


client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('interactionCreate', async (interaction: CommandInteraction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'anon') {
    const message = interaction.options.get('message')?.value as string;
    const member = interaction.member; // This is a GuildMember if in a guild
    const displayName = member?.displayName || interaction.user.username;


    // Send to owner's DMs
    const owner = await client.users.fetch(OWNER_ID);
    await owner.send(`Secret message from ${displayName}:\n${message}`);
    
    // Send announcement to #general
    const generalChannel = await client.channels.fetch(GENERAL_CHANNEL_ID);
    if (generalChannel?.isTextBased()) {
      await generalChannel.send(`${displayName} said something!`);
    }

    await interaction.reply({
      content: 'Your message has been sent secretly to the owner!',
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

  if (interaction.commandName === 'create-match') {
    if (interaction.user.id !== OWNER_ID) {
      await interaction.reply({
        content: 'You do not have permission for this command',
        ephemeral: true
      });
      return;
    }
    const team1 = interaction.options.get('team1')?.value as string;
    const team2 = interaction.options.get('team2')?.value as string;

    await createMatch({team1, team2});
    await interaction.reply({
      content: 'Match created!',
      ephemeral: true
    });
  }
});

client.login(process.env.DISCORD_TOKEN);