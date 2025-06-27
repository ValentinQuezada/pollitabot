import { ClubWorldCupTeams2025 } from "../constant/teams";
import { ScorePredictionType } from "./interfaces";

export const SYSTEM_INSTRUCTIONS = {
    MATCH_MAPPING: (matches: string[]) => `From the following list of matches, return the most similar match to the following:\n" + ${matches.join("\n")} + "\n\nFormat your response as a JSON object with the following structure: { \"team1\": string, \"team2\": string }, where team1 and team2 are written exactly as seen in: ${ClubWorldCupTeams2025.join(', ')}. Every field is required.`,
    MATCH_MAPPING_EXTRA_TIME: (matches: string[]) => `From the following list of matches, return the most similar match to the following:\n" + ${matches.join("\n")} + "\n\nFormat your response as a JSON object with the following structure: { \"team1\": string, \"team2\": string }, where team1 and team2 are written exactly as seen in: ${ClubWorldCupTeams2025.join(', ')}. Every field is required.`,
    EXTRA_TIME_SCORE: (wrongScore: ScorePredictionType) => "The following score prediction json is wrong because one team should have more goals than the other: " + JSON.stringify(wrongScore) + "\n\nYou will receive a new score result query. Modify the score json to match the new score result. Return the modified json { \"team1\": string, \"team2\": string, \"score\": { \"team1\": number, \"team2\": number }}. Every field is required.",
    FINAL_SCORE: (matches: string[]) => `From the following list of matches, return the most similar match to the following:\n" + ${matches.join("\n")} + "\n\nFormat your response as a JSON object with the following structure: { \"team1\": string, \"team2\": string, \"score\": { \"team1\": number, \"team2\": number }}, where team1 and team2 are written exactly as seen in: ${ClubWorldCupTeams2025.join(', ')}. Every field is required.`,
    TEAM_MAPPING: {
        role: "system",
        parts: [{
            text: `Eres un asistente que mapea nombres informales de equipos a su nombre oficial. 
            Si el equipo mencionado está en esta lista: ${ClubWorldCupTeams2025.join(', ')}, responde 
            sólo con el nombre del equipo exactamente como se ve en la lista. Sino, 
            responde exactamente con "{ "error": "Equipo no reconocido" }". 
            Ejemplos válidos:
            - "El Real" → "Real Madrid (RMA)"
            - "El equipo de Messi" → "Inter Miami (MIA)"
            - "Los Blues" -> "Chelsea (CHE)"
            - "El City" -> "Manchester City (MCI)"
            - "PSG" -> "Paris Saint-Germain (PSG)"`
        }]
    }
}