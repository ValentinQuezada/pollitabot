import { Schema, Document, Types } from "mongoose";

export interface PredictionDocument extends Document {
  userId: string;
  matchId: Types.ObjectId;
  prediction: {
    team1: number;
    team2: number;
  };
  isWinner: boolean;
  auraGiven: number;
  createdAt: Date;
}

export const PredictionSchema = new Schema<PredictionDocument>({
  userId: { type: String, required: true },
  matchId: { type: Schema.Types.ObjectId, required: true, ref: "Match" },
  prediction: {
    team1: { type: Number, required: true },
    team2: { type: Number, required: true }
  },
  isWinner: { type: Boolean, default: false },
  auraGiven: { type: Number, default: 0},
  createdAt: { type: Date, default: Date.now }
});