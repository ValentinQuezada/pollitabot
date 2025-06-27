import TEAMS_JSON from '../../data/teams.json'

export const ClubWorldCupTeams2025 = TEAMS_JSON.map((team) => `${team.name} (${team.alias})`)