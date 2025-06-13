import { ScorePredictionType } from "./interfaces";
import { ClubWorldCupTeams2025 } from "../bot/events/interactionCreate";

export const SYSTEM_INSTRUCTIONS = {
    EXTRA_TIME_SCORE: (wrongScore: ScorePredictionType) => "The following score prediction json is wrong because one team should have more goals than the other: " + JSON.stringify(wrongScore) + "\n\nYou will receive a new score result query. Modify the score json to match the new score result. Return the modified json { \"team1\": string, \"team2\": string, \"score\": { \"team1\": number, \"team2\": number }}. Every field is required.",
    FINAL_SCORE: (matches: string[]) => "From the following list of matches, return the most similar match to the following: " + matches.join("\n") + "\n\nFormat your response as a JSON object with the following structure: { \"team1\": string, \"team2\": string, \"score\": { \"team1\": number, \"team2\": number }}. Every field is required.",
    TEAM_MAPPING: {
        role: "system",
        parts: [{
            text: `Eres un asistente que mapea nombres informales de equipos a su nombre oficial. 
            Si el equipo mencionado NO está en esta lista: ${ClubWorldCupTeams2025.join(', ')} 
            responde exactamente con { "error": "Equipo no reconocido" }. 
            Ejemplos válidos:
            - "El Real" → "Real Madrid"
            - "El equipo de Messi" → "Inter Miami"
            - "El Real" -> "Real Madrid"
            - "Los Blues" -> "Chelsea"
            - "El City" -> "Manchester City"
            - "PSG" -> "Paris Saint-Germain"`
        }]
    }
}