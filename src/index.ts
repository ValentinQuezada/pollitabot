import directMessageEvent from './bot/events/directMessage';
import interactionCreateEvent from './bot/events/interactionCreate';
import readyEvent from './bot/events/ready';
import BOT_CLIENT from './bot/init';
import { DISCORD_TOKEN } from './constant/credentials';

BOT_CLIENT.on('interactionCreate', interactionCreateEvent);
BOT_CLIENT.on('ready', readyEvent);
BOT_CLIENT.on('messageCreate', directMessageEvent);

BOT_CLIENT.login(DISCORD_TOKEN);