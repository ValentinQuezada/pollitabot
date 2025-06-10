import { REST, Routes } from 'discord.js';
import { commands } from './bot';

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.CLIENT_ID!;
const guildId = process.env.GUILD_ID!; // Optional: For guild-specific registration

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Use this for guild-specific commands (faster, for testing)
    await rest.put(
       Routes.applicationGuildCommands(clientId, guildId),
       { body: commands }
    );

    // Use this for global commands (takes up to an hour to propagate)
    /* await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    ); */

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
