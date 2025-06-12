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

export const AdditionalTimeScorePredictionSchema = ScorePredictioSchema.extend({
    winner: z.enum(["team1", "team2"]) 
});

export type AdditionalTimeScorePredictionType = z.infer<typeof AdditionalTimeScorePredictionSchema>;

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
