import { CommandInteraction, Interaction } from "discord.js";
import {
  anonCommand,
  createAwardCommand,
  createMatchCommand,
  sayCommand,
  seeMissingCommand,
  seeResultsCommand,
  sendMatchStatsCommand,
  sendMissingCommand,
  sendScorePredictionCommand,
  setGroupStageOnlyCommand,
  updateAwardResultCommand,
  updateMatchScoreCommand,
  sendAwardPredictionCommand,
  auraLeaderboardCommand,
  userStatsLeaderboardCommand,
} from "../interaction";
import databaseConnection from "../../database/connection";

export const ClubWorldCupTeams2025 = [
  // UEFA
  "Manchester City",
  "Chelsea",
  "Real Madrid",
  "Bayern München",
  "Paris Saint-Germain",
  "Inter Milan",
  "Benfica",
  "Porto",
  "Borussia Dortmund",
  "Atlético de Madrid",
  "Red Bull Salzburg",
  "Juventus",
  // CONMEBOL
  "Flamengo",
  "Palmeiras",
  "Fluminense",
  "River Plate",
  "Boca Juniors",
  "Botafogo",
    // CONCACAF
  "Monterrey",
  "Seattle Sounders",
  "Pachuca",
  "Los Angeles FC",
  // Anfitrión (USA)
  "Inter Miami",
  // AFC (Asia)
  "Al Hilal",
  "Al Ain",
  "Urawa Red Diamonds",
  "Ulsan HD",
  // OFC (Oceanía)
  "Auckland City",
  // CAF (África)
  "Al Ahly",
  "Espérance de Tunis",
  "Wydad Casablanca",
  "Mamelodi Sundowns"
];

export async function checkRole(interaction: CommandInteraction, roleName: string): Promise<boolean> {
  if (!interaction.inGuild()) return false;

  try {
    // Obtener el miembro actualizado del servidor
    const member = await interaction.guild?.members.fetch(interaction.user.id);
    if (!member) return false;

    // Convertir a array de nombres de roles en minúsculas
    const memberRoles = member.roles.valueOf(); // Obtiene Collection<string, Role>
    const roleNames = memberRoles.map(role => role.name.toLowerCase());

    return roleNames.includes(roleName.toLowerCase());
  } catch (error) {
    console.error("Error checking role:", error);
    return false;
  }
}

const interactionCreateEvent = async (interaction: Interaction) => {
  
  // --- Manejo de Autocomplete ---
  if (interaction.isAutocomplete()){
    if(interaction.commandName === 'send-award-prediction' || interaction.commandName === 'update-award-result' ) {
      const focusedOption = interaction.options.getFocused(true); // Obtén el campo enfocado
      const focusedValue = focusedOption.value;
      const focusedField = focusedOption.name;

      const db = await databaseConnection();

      if(focusedField === 'award' || focusedField === 'name'){
        const Award = db.model("Award");
        const awards = await Award.find({ name: { $regex: focusedValue, $options: "i" } });

        const choices = awards.map(a => ({
          name: a.name,
          value: a.name
        }));

        await interaction.respond(choices);
      } else if (focusedField === 'prediction' || focusedField === 'result') {
        const filteredTeams = ClubWorldCupTeams2025
          .filter(team => team.toLowerCase().includes(focusedValue))
          .slice(0,25)
          .map(team => ({
            name: team,
            value: team
          }));
        await interaction.respond(filteredTeams);
      }
      return; 
    }

  }


  // --- Manejo de comandos normales ---
  if (!interaction.isCommand()) return;
  
  const commandInteraction = interaction as CommandInteraction;
  
  switch (commandInteraction.commandName) {
    case 'anon':
      await anonCommand(commandInteraction);
      break;
    case 'say':
      await sayCommand(commandInteraction);
      break;
    case 'create-match':
      await createMatchCommand(commandInteraction);
      break;
    case 'update-match-score':
      await updateMatchScoreCommand(commandInteraction);
      break;
    case 'create-award':
      await createAwardCommand(commandInteraction);
      break;
    case 'update-award-result':
      await updateAwardResultCommand(commandInteraction);
      break;
    case 'send-score-prediction':
      await sendScorePredictionCommand(commandInteraction);
      break;
    case 'see-results':
      await seeResultsCommand(commandInteraction);
      break;
    case 'send-missing':
      await sendMissingCommand(commandInteraction);
      break;
    case 'set-group-stage-only':
      await setGroupStageOnlyCommand(commandInteraction);
      break;
    case 'send-match-stats':
      await sendMatchStatsCommand(commandInteraction);
      break;
    case 'see-missing':
      await seeMissingCommand(commandInteraction);
      break;
    case 'send-award-prediction':
      await sendAwardPredictionCommand(commandInteraction);
      break;
    case 'aura-leaderboard':
      await auraLeaderboardCommand.execute(commandInteraction);
      break;
    case 'user-stats-leaderboard':
      await userStatsLeaderboardCommand.execute(commandInteraction);
      break;
  }
};

export default interactionCreateEvent;
