import { CommandInteraction } from "discord.js";
import { MatchTypeEnum } from "../../schemas/match";
import { createMatch } from "../../database/controllers";
import { checkRole } from "../events/interactionCreate";
import BOT_CLIENT from "../init";
import { GENERAL_CHANNEL_ID } from "../../constant/credentials";

const createMatchCommand = async (interaction: CommandInteraction) => {
  const hasRole = await checkRole(interaction, "ADMIN");
    
  if (!hasRole) {
    await interaction.reply({
      content: `⛔ No tienes permiso para usar este comando.`,
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });
  
  const team1 = interaction.options.get('team1')?.value as string;
  const team2 = interaction.options.get('team2')?.value as string;
  const datetime = interaction.options.get('datetime')?.value as string;
  const group = interaction.options.get('group')?.value as string;
  const matchType = interaction.options.get('matchtype')?.value as MatchTypeEnum;
  const fee = interaction.options.get('fee')?.value as number ?? 5;

  function limaToUTC(dateString: string) {
    const [date, time] = dateString.split(" ");
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    return new Date(Date.UTC(year, month - 1, day, hour + 5, minute));
  }

  await createMatch({
    team1,
    team2,
    datetime: limaToUTC(datetime),
    group,
    matchType,
    isFinished: false,
    hasStarted: false,
    specialHit: false,
    lateGoalHit: false,
    upsetHit: false,
    fee: 5
  });

  const announceMsg = `📢 *¡Nuevo partido creado!\n**${team1} vs. ${team2}**\n🕒 Empieza el ${datetime} (hora Perú)\nEnvía tu predicción con* \`/send-score-prediction\``;

  // send announcement to the general channel
  try {
    const channel = await BOT_CLIENT.channels.fetch(GENERAL_CHANNEL_ID);
    if (channel && 'send' in channel) {
      await channel.send(announceMsg);
    }
  } catch (e) {
    console.error("Error al enviar el mensaje al canal general:", e);
    await interaction.editReply({
      content: "❌ No se pudo enviar el mensaje de anuncio al canal general."
    });
    return;
  }

  await interaction.editReply({
    content: `¡Partido **${team1} vs. ${team2}** creado con éxito!`
  });
};

export default createMatchCommand;