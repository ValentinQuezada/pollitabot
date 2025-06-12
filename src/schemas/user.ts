import { Schema, Document } from "mongoose";

export interface UserStatsDocument extends Document {
  userId: string;
  totalPredictions: number;
  correctPredictions: number;
  incorrectPredictions: number;
  noWinnersPredictions: number;
  streak: number;
  loss: number;
  gain: number;
  total: number;
  onlyGroupStage: boolean; // true = only group stage
  missedNonGroupPredictions: number; // matches missed in non-group stages
}

export const UserStatsSchema = new Schema<UserStatsDocument>({
  userId: { type: String, required: true, unique: true },
  totalPredictions: { type: Number, default: 0 },
  correctPredictions: { type: Number, default: 0 },
  incorrectPredictions: { type: Number, default: 0 },
  noWinnersPredictions: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  loss: { type: Number, default: 0 },
  gain: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  onlyGroupStage: { type: Boolean, default: true },
  missedNonGroupPredictions: { type: Number, default: 0 }
});