import { Schema, Document, Types } from "mongoose";
import { z } from "zod";

const createMatchSchema = z.object({
    team1: z.string(),
    team2: z.string(),
    datetime: z.date(),
    group: z.string().length(1)
});

export type CreateMatchType = z.infer<typeof createMatchSchema>;

const updateMatchScoreSchema = z.object({
    score: z.object({
        team1: z.number().min(0).max(100),
        team2: z.number().min(0).max(100)
    }).optional(),
    extraTimeScore: z.object({
        team1: z.number().min(0).max(100),
        team2: z.number().min(0).max(100)
    }).optional(),
    penaltyScore: z.object({
        team1: z.number().min(0).max(100),
        team2: z.number().min(0).max(100),
    }).optional()
});

const MatchSchema = createMatchSchema.merge(updateMatchScoreSchema);

export type MatchType = z.infer<typeof MatchSchema>;

export interface MatchDocument extends MatchType, Document {
    _id: Types.ObjectId; // <-- id Mongoose
    createdAt: Date;
    updatedAt: Date;
}

export const MatchMongoose = new Schema<MatchDocument>({
    team1: String,
    team2: String,
    datetime: Date,
    group: String,
    score: { type: {
        team1: Number,
        team2: Number
    }, default: undefined, _id: false },
    extraTimeScore: { type: {
        team1: Number,
        team2: Number
    }, default: undefined, _id: false },
    penaltyScore: { type: {
        team1: Number,
        team2: Number
    }, default: undefined, _id: false }
}, {
    timestamps: true
});