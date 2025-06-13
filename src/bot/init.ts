import { Client, IntentsBitField } from "discord.js";
import "./jobs/matchStartJob";

const BOT_CLIENT = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.DirectMessages
  ]
});

export default BOT_CLIENT;