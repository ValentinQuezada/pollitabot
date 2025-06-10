import { Schema } from "mongoose";
import { z } from "zod";

const MatchSchema = z.object({
    team1: z.string(),
    team2: z.string()
});

export type MatchType = z.infer<typeof MatchSchema>;

export interface MatchDocument extends MatchType, Document {
    createdAt: Date;
    updatedAt: Date;
}

export const MatchMongoose = new Schema<MatchDocument>({
    team1: String,
    team2: String
}, {
    timestamps: true
});
    