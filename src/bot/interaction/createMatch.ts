import { CommandInteraction } from "discord.js";
import { MatchTypeEnum } from "../../schemas/match";
import { createMatch } from "../../database/controllers";
import { checkRole } from "../events/interactionCreate";

const createMatchCommand = async (interaction: CommandInteraction) => {
  const hasRole = await checkRole(interaction, "ADMIN");
    
  if (!hasRole) {
    await interaction.reply({
      content: `⛔ No tienes permiso para usar este comando.`,
      ephemeral: true
    });
    return;
  }
  
  const team1 = interaction.options.get('team1')?.value as string;
  const team2 = interaction.options.get('team2')?.value as string;
  const datetime = interaction.options.get('datetime')?.value as string;
  const group = interaction.options.get('group')?.value as string;
  const matchType = interaction.options.get('matchtype')?.value as MatchTypeEnum;

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
    hasStarted: false
  });

  await interaction.reply({
    content: `¡Partido **${team1} vs. ${team2}** creado con éxito!`,
    ephemeral: true
  });
};

export default createMatchCommand;