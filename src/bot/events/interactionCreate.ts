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
  sendOtherPredictionCommand,
  setGroupStageOnlyCommand,
  updateAwardResultCommand,
  updateMatchScoreCommand,
  sendAwardPredictionCommand,
  auraLeaderboardCommand,
  userStatsLeaderboardCommand,
  seeMatches,
  assignAuraTopBonusesCommand
} from "../interaction";
import databaseConnection from "../../database/connection";

export const ClubWorldCupTeams2025 = [
  // UEFA
  "Manchester City (MCI)",
  "Chelsea (CHE)",
  "Real Madrid (RMA)",
  "Bayern München (BAY)",
  "Paris Saint-Germain (PSG)",
  "Inter Milan (INT)",
  "Benfica (BEN)",
  "Porto (POR)",
  "Borussia Dortmund (DOR)",
  "Atlético de Madrid (ATM)",
  "Red Bull Salzburg (SAL)",
  "Juventus (JUV)",
  // CONMEBOL
  "Flamengo (FLA)",
  "Palmeiras (PAL)",
  "Fluminense (FLU)",
  "River Plate (RIV)",
  "Boca Juniors (BOC)",
  "Botafogo (BOT)",
    // CONCACAF
  "Monterrey (MON)",
  "Seattle Sounders (SEA)",
  "Pachuca (PAC)",
  "Los Angeles FC (LAF)",
  // Anfitrión (USA)
  "Inter Miami (MIA)",
  // AFC (Asia)
  "Al Hilal (HIL)",
  "Al Ain (AIN)",
  "Urawa Red Diamonds (URA)",
  "Ulsan HD (ULS)",
  // OFC (Oceanía)
  "Auckland City (AUC)",
  // CAF (África)
  "Al Ahly (AHL)",
  "Espérance de Tunis (EST)",
  "Wydad Casablanca (WYD)",
  "Mamelodi Sundowns (SUN)"
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
    if(interaction.commandName === 'send-award-prediction'
      || interaction.commandName === 'update-award-result'
      || interaction.commandName === 'update-match-score'
      || interaction.commandName === 'send-match-stats'
      || interaction.commandName === 'create-match'
      || interaction.commandName === 'send-missing') {
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
      } else if (focusedField === 'prediction'
        || focusedField === 'result'
        || focusedField === 'team1'
        || focusedField === 'team2') {
        const filteredTeams = ClubWorldCupTeams2025
          .filter(team => team.toLowerCase().includes(focusedValue.toLowerCase()))
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
    case 'send-other-prediction':
      await sendOtherPredictionCommand(commandInteraction);
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
    case 'see-matches':
      await seeMatches(commandInteraction);
      break;
    case 'send-matches':
      await seeMatches(commandInteraction);
      break;
    case 'send-award-prediction':
      await sendAwardPredictionCommand(commandInteraction);
      break;
    case 'aura-leaderboard':
      await auraLeaderboardCommand.execute(commandInteraction);
      break;
    case 'userstats-leaderboard':
      await userStatsLeaderboardCommand.execute(commandInteraction);
      break;
    case 'assign-aura-top-bonuses':
      await assignAuraTopBonusesCommand(commandInteraction);
      break;
  }
};

export default interactionCreateEvent;
