import { ScorePredictionType } from "./interfaces";

export const SYSTEM_INSTRUCTIONS = {
    EXTRA_TIME_SCORE: (wrongScore: ScorePredictionType) => "The following score prediction json is wrong because one team should have more goals than the other: " + JSON.stringify(wrongScore) + "\n\nYou will receive a new score result query. Modify the score json to match the new score result. Return the modified json { \"team1\": string, \"team2\": string, \"score\": { \"team1\": number, \"team2\": number }}. Every field is required.",
    FINAL_SCORE: (matches: string[]) => "From the following list of matches, return the most similar match to the following: " + matches.join("\n") + "\n\nFormat your response as a JSON object with the following structure: { \"team1\": string, \"team2\": string, \"score\": { \"team1\": number, \"team2\": number }}. Every field is required.",
}