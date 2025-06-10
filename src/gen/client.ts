import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_API_KEY } from "../constant/credentials";
import { extractFromCodeblock } from "../utils/codeblock";
import { GenContentResponse, ScorePrediction } from "./interfaces";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY});

export async function linkMatchScore(query: string, matches: string[]): Promise<GenContentResponse<ScorePrediction>> {
    const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    config: {
        systemInstruction: "From the following list of matches, return the most similar match to the following: " + matches.join("\n") + "\n\nFormat your response as a JSON object with the following structure: { team1: string, team2: string, score: { team1: number, team2: number } }. Every field is required.",
        maxOutputTokens: 100,
        temperature: 0.1,
        responseMimeType: "application/json",
    },
        contents: query
    });

    if(response.text === undefined) {
        return {
            success: false,
            error: "Response text is undefined"
        }
    }

    const data = extractFromCodeblock(response.text);

    try{
        const jsonData = JSON.parse(data);
        return {
            success: true,
            data: jsonData
        };
    } catch (e) {
        console.log(e);
        return {
            success: false,
            error: "Invalid JSON"
        }
    }
}