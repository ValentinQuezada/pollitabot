import { Client, IntentsBitField } from "discord.js";
import interactionCreateEvent from "./events/interactionCreate";
import readyEvent from "./events/ready";
import "./jobs/matchStartJob";

const BOT_CLIENT = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.DirectMessages
  ]
});

BOT_CLIENT.on('interactionCreate', interactionCreateEvent);
BOT_CLIENT.on('ready', readyEvent);

export default BOT_CLIENT;