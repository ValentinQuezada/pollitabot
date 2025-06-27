import { z } from "zod";
import { ClubWorldCupTeams2025 } from "../constant/teams";

export const ScorePredictioSchema = z.object({
    team1: z.string(),
    team2: z.string(),
    score: z.object({
        team1: z.number(),
        team2: z.number()
    })
});

export const ExtraScorePredictionSchema = ScorePredictioSchema.extend({
    advances: z.enum(["team1", "team2"]).default(Math.random() > 0.5 ? "team1" : "team2")
}).transform(data => ({
    ...data, 
    advances: (data.score.team1 > data.score.team2 ? "team1" : "team2") as "team1" | "team2"
}));

export type ScorePredictionType = z.infer<typeof ScorePredictioSchema>;
export type ExtraScorePredictionType = z.infer<typeof ExtraScorePredictionSchema>;

export type PredictionType = ScorePredictionType | ExtraScorePredictionType;

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
    team: z.enum([...ClubWorldCupTeams2025] as [string, ...string[]])
});