import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../constant/credentials";
import { extractFromCodeblock } from "../utils/codeblock";
import { GenContentResponse, ScorePredictionType, ScorePredictioSchema, TeamNameType, TeamNameSchema } from "./interfaces";
import { SYSTEM_INSTRUCTIONS } from "./prompts";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const modelName = "gemini-2.0-flash";

export async function linkMatchScore(query: string, matches: [string, string][]): Promise<GenContentResponse<ScorePredictionType>> {
    const response = await ai.models.generateContent({
        model: modelName,
        config: {
            systemInstruction: SYSTEM_INSTRUCTIONS.FINAL_SCORE(
                matches.map(match => match.join(' vs '))
            ),
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
        let jsonData = JSON.parse(data);
        if (Array.isArray(jsonData)) {
            jsonData = jsonData[0];
        }
        const parsedData = ScorePredictioSchema.parse(jsonData);

        const match = matches.find(
            match => match[0] === parsedData.team1 && match[1] === parsedData.team2 || match[0] === parsedData.team2 && match[1] === parsedData.team1
        );
        if (!match) {
            return {
                success: false,
                error: "No match found"
            }
        }

        if (parsedData.team1 === match[1]) {
            parsedData.team1 = match[0];
            parsedData.team2 = match[1];
            parsedData.score.team1 = parsedData.score.team2;
            parsedData.score.team2 = parsedData.score.team1;
        }

        return {
            success: true,
            data: parsedData
        };
    } catch (e) {
        console.error(e);
        return {
            success: false,
            error: `Invalid JSON ${e}`
        }
    }
}

export async function fixScoreExtraTime(query: string, wrongScore: ScorePredictionType): Promise<GenContentResponse<ScorePredictionType>> {
    const response = await ai.models.generateContent({
        model: modelName,
        config: {
            systemInstruction: SYSTEM_INSTRUCTIONS.EXTRA_TIME_SCORE(wrongScore),
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
        let jsonData = JSON.parse(data);
        if (Array.isArray(jsonData)) {
            jsonData = jsonData[0];
        }
        const parsedData = ScorePredictioSchema.parse(jsonData);
        return {
            success: true,
            data: parsedData
        };
    } catch (e) {
        console.error(e);
        return {
            success: false,
            error: `Invalid JSON ${e}`
        }
    }
}

export async function mapTeamName(
  query: string
): Promise<GenContentResponse<TeamNameType>> {
  const response = await ai.models.generateContent({
    model: modelName,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS.TEAM_MAPPING,
      maxOutputTokens: 50,
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          team: {
            type: "string",
            enum: [
              "Al Ahly", "Al Ain", "Al Hilal", "Urawa Red Diamonds", "Ulsan HD",
              "Espérance de Tunis", "Wydad Casablanca", "Mamelodi Sundowns",
              "Monterrey", "Seattle Sounders", "Pachuca", "Los Angeles FC",
              "Flamengo", "Palmeiras", "Fluminense", "River Plate", "Boca Juniors", "Botafogo",
              "Auckland City", "Manchester City", "Chelsea", "Real Madrid", "Bayern München",
              "Paris Saint-Germain", "Inter Milan", "Benfica", "Porto", "Borussia Dortmund",
              "Atlético de Madrid", "Red Bull Salzburg", "Juventus", "Inter Miami"
            ]
          }
        },
        required: ["team"]
      }
    },
    contents: `Identifica el equipo de fútbol mencionado en: "${query}"`
  });

  if (!response.text) {
    return { success: false, error: "No response text" };
  }

  try {
    const data = extractFromCodeblock(response.text);
    const jsonData = JSON.parse(data);
    const parsedData = TeamNameSchema.parse(jsonData);
    
    return {
      success: true,
      data: parsedData
    };
  } catch (e) {
    console.error("Error mapping team name:", e);
    return {
      success: false,
      error: `Invalid team mapping: ${e instanceof Error ? e.message : e}`
    };
  }
}