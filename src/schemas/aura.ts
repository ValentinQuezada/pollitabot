import { Schema, Document } from "mongoose";

export interface AuraPointsDocument extends Document {
  userId: string;
  matchesHit: number;       // Partidos atinados
  uniqueHit: number;        // Unico en atinar un partido
  specialHit: number;       // Atinar 0-0 o >4 goles
  lateGoalHit: number;      // Atinar con un gol a los 90' o más
  upsetHit: number;         // Atinar a un resultado donde pierde el favorito
  streak3plus: number;      // Racha de 3 atinados consecutivos (cuenta partidos a partir del 3ro)
  topProfit: number;        // Puntos por mayor profit
  topWinRate: number;       // Puntos por mayor win rate
  topStreak: number;        // Puntos por mayor racha
  awardHit: number;         // Atinar Award
  totalPoints: number;
}

export const AuraPointsSchema = new Schema<AuraPointsDocument>({
  userId: { type: String, required: true, unique: true },
  matchesHit: { type: Number, default: 0 },
  uniqueHit: { type: Number, default: 0 },
  specialHit: { type: Number, default: 0 },
  lateGoalHit: { type: Number, default: 0 },
  upsetHit: { type: Number, default: 0 },
  streak3plus: { type: Number, default: 0 },
  topProfit: { type: Number, default: 0 },
  topWinRate: { type: Number, default: 0 },
  topStreak: { type: Number, default: 0 },
  awardHit: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 }
});