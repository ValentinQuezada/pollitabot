import { z } from "zod";
import { ClubWorldCupTeams2025 } from "../constant/teams";

export const ScorePredictionSchema = z.object({
    team1: z.string(),
    team2: z.string(),
    score: z.object({
        team1: z.number(),
        team2: z.number()
    }),
    advances: z.enum(["team1", "team2"]).nullish()
});

export const ExtraScorePredictionSchema = ScorePredictionSchema.transform(data => ({
    ...data, 
    advances: (data.score.team1 > data.score.team2 ? "team1" : "team2") as "team1" | "team2"
}));

export type ScorePredictionType = z.infer<typeof ScorePredictionSchema>;

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