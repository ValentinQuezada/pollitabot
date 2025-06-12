import { Schema, Document, Types } from "mongoose";
import { z } from "zod";

// Enum for match types
export const matchTypes = [
    "group-regular",
    "group-extra",
    "round-of-16-regular",
    "round-of-16-extra",
    "quarterfinal-regular",
    "quarterfinal-extra",
    "semifinal-regular",
    "semifinal-extra",
    "final-regular",
    "final-extra",
    "third-place-regular",
    "third-place-extra"
] as const;

export type MatchTypeEnum = typeof matchTypes[number];

// Zod schema for match creation
const createMatchSchema = z.object({
    team1: z.string(),
    team2: z.string(),
    datetime: z.date(),
    group: z.string().length(1),
    matchType: z.enum(matchTypes)
});

export type CreateMatchType = z.infer<typeof createMatchSchema>;

// Zod schema for updating match score (only regular score now)
const updateMatchScoreSchema = z.object({
    score: z.object({
        team1: z.number().min(0).max(100),
        team2: z.number().min(0).max(100)
    }).optional()
});

const MatchSchema = createMatchSchema.merge(updateMatchScoreSchema);

export type MatchType = z.infer<typeof MatchSchema>;

export interface MatchDocument extends MatchType, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose schema for Match (no extraTimeScore or penaltyScore)
export const MatchMongoose = new Schema<MatchDocument>({
    team1: String,
    team2: String,
    datetime: Date,
    group: String,
    matchType: { type: String, enum: matchTypes, required: true },
    score: { 
        type: {
            team1: Number,
            team2: Number
        }, 
        default: undefined, 
        _id: false 
    }
}, {
    timestamps: true
});