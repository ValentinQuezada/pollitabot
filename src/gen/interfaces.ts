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
  team: z.enum([...ClubWorldCupTeams2025] as [string, ...string[]])
});