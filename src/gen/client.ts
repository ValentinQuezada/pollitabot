import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../constant/credentials";
import { extractFromCodeblock } from "../utils/codeblock";
import { AdditionalTimeScorePredictionSchema, AdditionalTimeScorePredictionType, GenContentResponse, ScorePredictionType, ScorePredictioSchema } from "./interfaces";
import { SYSTEM_INSTRUCTIONS } from "./prompts";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function linkMatchScore(query: string, matches: string[]): Promise<GenContentResponse<ScorePredictionType>> {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        config: {
            systemInstruction: SYSTEM_INSTRUCTIONS.FINAL_SCORE(matches),
            maxOutputTokens: 100,
            temperature: 0.1,
            responseMimeType: "application/json",
        },
        contents: query
    });

    if (response.text === undefined) {
        return {
            success: false,
            error: "Response text is undefined"
        }
    }

    try {
        const data = extractFromCodeblock(response.text);

        const jsonData = ScorePredictioSchema.parse(data);
        return {
            success: true,
            data: jsonData
        };
    } catch (e) {
        console.error(e);
        return {
            success: false,
            error: `Invalid JSON ${e}`
        }
    }
}

export async function linkMatchScoreExtraTime(query: string, matches: string[]): Promise<GenContentResponse<AdditionalTimeScorePredictionType>> {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        config: {
            systemInstruction: SYSTEM_INSTRUCTIONS.EXTRA_TIME_SCORE(matches),
            maxOutputTokens: 100,
            temperature: 0.1,
            responseMimeType: "application/json",
        },
        contents: query
    });

    if (response.text === undefined) {
        return {
            success: false,
            error: "Response text is undefined"
        }
    }

    try {
        const data = extractFromCodeblock(response.text);

        const jsonData = AdditionalTimeScorePredictionSchema.parse(data);
        return {
            success: true,
            data: jsonData
        };
    } catch (e) {
        console.error(e);
        return {
            success: false,
            error: `Invalid JSON ${e}`
        }
    }
}