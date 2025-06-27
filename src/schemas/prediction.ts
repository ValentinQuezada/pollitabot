import { Schema, Document, Types } from "mongoose";

export interface PredictionDocument extends Document {
  userId: string;
  matchId: Types.ObjectId;
  prediction: {
    team1: number;
    team2: number;
    advances?: "team1" | "team2";
  };
  isWinner: boolean;
  auraGiven: number;
  createdAt: Date;
  allowedToBet?: string[];
}

export const PredictionSchema = new Schema<PredictionDocument>({
  userId: { type: String, required: true },
  matchId: { type: Schema.Types.ObjectId, required: true, ref: "Match" },
  prediction: {
    team1: { type: Number, required: true },
    team2: { type: Number, required: true },
    advances: { type: String, enum: ["team1", "team2"], default: undefined }
  },
  isWinner: { type: Boolean, default: false },
  auraGiven: { type: Number, default: 0},
  createdAt: { type: Date, default: Date.now },
  allowedToBet: [{ type: String }]
});