import { Schema, Document, Types } from "mongoose";
import { z } from "zod";

// Zod schema para creación de award
const createAwardSchema = z.object({
    name: z.string(),
});

export type CreateAwardType = z.infer<typeof createAwardSchema>;

// Zod schema para actualización de result (opcional)
const updateAwardResultSchema = z.object({
    result: z.string().optional()
});

const AwardSchema = createAwardSchema.merge(updateAwardResultSchema);

export type AwardType = z.infer<typeof AwardSchema>;

export interface AwardDocument extends AwardType, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose schema para Award
export const AwardMongoose = new Schema<AwardDocument>({
    name: { type: String, required: true },
    result: { type: String }
}, {
    timestamps: true
});
