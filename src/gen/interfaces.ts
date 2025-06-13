import { z } from "zod";

export const ScorePredictioSchema = z.object({
    team1: z.string(),
    team2: z.string(),
    score: z.object({
        team1: z.number(),
        team2: z.number()
    })
});

export type ScorePredictionType = z.infer<typeof ScorePredictioSchema>;

interface GenContentSuccessResponse<T> {
    success: true;
    data: T;
}

interface GenContentErrorResponse {
    success: false;
    error: string;
    data?: never;
}

export type GenContentResponse<T> = GenContentSuccessResponse<T> | GenContentErrorResponse;

export type TeamNameType = {
  team: string;
};

export const TeamNameSchema = z.object({
  team: z.enum([
    "Al Ahly", "Al Ain", "Al Hilal", "Urawa Red Diamonds", "Ulsan HD",
    "Espérance de Tunis", "Wydad Casablanca", "Mamelodi Sundowns",
    "Monterrey", "Seattle Sounders", "Pachuca", "Los Angeles FC",
    "Flamengo", "Palmeiras", "Fluminense", "River Plate", "Boca Juniors", "Botafogo",
    "Auckland City", "Manchester City", "Chelsea", "Real Madrid", "Bayern München",
    "Paris Saint-Germain", "Inter Milan", "Benfica", "Porto", "Borussia Dortmund",
    "Atlético de Madrid", "Red Bull Salzburg", "Juventus", "Inter Miami"
  ])
});