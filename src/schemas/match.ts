import { Schema, Document, Types } from "mongoose";
import { z } from "zod";

// Enum for match types
export const matchTypes = [
    "group-regular",
    "round-of-16-regular",
    "round-of-16-extra",
    "quarterfinal-regular",
    "quarterfinal-extra",
    "semifinal-regular",
    "semifinal-extra",
    "final-regular",
    "final-extra",
] as const;

export type MatchTypeEnum = typeof matchTypes[number];

// Zod schema for match creation
const createMatchSchema = z.object({
    team1: z.string(),
    team2: z.string(),
    datetime: z.date(),
    group: z.string().length(1),
    matchType: z.enum(matchTypes),
    isFinished: z.boolean().default(false),
    hasStarted: z.boolean().default(false),
    specialHit: z.boolean().default(false),
    lateGoalHit: z.boolean().default(false),
    upsetHit: z.boolean().default(false),
    fee: z.number().min(0).max(20),
    statsAnnounced: z.boolean().default(false)
});

export type CreateMatchType = z.infer<typeof createMatchSchema>;

// Zod schema for updating match score (only regular score now)
const updateMatchScoreSchema = z.object({
    score: z.object({
        team1: z.number().min(0).max(100),
        team2: z.number().min(0).max(100),
        advances: z.enum(['team1', 'team2']).optional()
    }).optional(),
    specialHit: z.boolean().default(false),
    lateGoalHit: z.boolean().default(false),
    upsetHit: z.boolean().default(false)
});

const MatchSchema = createMatchSchema.merge(updateMatchScoreSchema).extend({
    _id: z.any()
});

export type MatchType = z.infer<typeof MatchSchema>;

export interface MatchDocument extends Omit<MatchType, "_id">, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    isFinished: boolean;
    hasStarted: boolean;
    specialHit: boolean;
    lateGoalHit: boolean;
    upsetHit: boolean;
    fee: number;
    statsAnnounced: boolean;
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
            team2: Number,
            advances: { type: String, enum: ["team1", "team2"], default: undefined }
        }, 
        default: undefined, 
        _id: false,
    },
    isFinished: { type: Boolean, default: false },
    hasStarted: { type: Boolean, default: false },
    specialHit: { type: Boolean, default: false },
    lateGoalHit: { type: Boolean, default: false },
    upsetHit: { type: Boolean, default: false },
    fee: { type: Number, default: 5},
    statsAnnounced: { type: Boolean, default: false }
}, {
    timestamps: true
});