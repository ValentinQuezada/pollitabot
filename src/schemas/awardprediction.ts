import { Schema, Document, Types } from "mongoose";

export interface AwardPredictionDocument extends Document {
  userId: string;
  awardId: Types.ObjectId; // Referencia al award
  prediction: string; // Texto libre del usuario (ej: "Lionel Messi")
  isWinner?: boolean; // Opcional: para marcar si acertó
  createdAt: Date;
}

export const AwardPredictionSchema = new Schema<AwardPredictionDocument>({
  userId: { type: String, required: true },
  awardId: { type: Schema.Types.ObjectId, required: true, ref: "Award" },
  prediction: { type: String, required: true },
  isWinner: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
