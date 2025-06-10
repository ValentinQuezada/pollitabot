import { REST, Routes } from 'discord.js';
import BOT_COMMANDS from './constant/commands';
import { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } from './constant/credentials';

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Use this for guild-specific commands (faster, for testing)
    await rest.put(
       Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
       { body: BOT_COMMANDS }
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
