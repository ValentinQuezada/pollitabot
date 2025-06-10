import { DISCORD_TOKEN } from './constant/credentials';
import BOT_CLIENT from './bot/init';

BOT_CLIENT.login(DISCORD_TOKEN);