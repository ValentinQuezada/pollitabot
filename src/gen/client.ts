import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../constant/credentials";
import { extractFromCodeblock } from "../utils/codeblock";
import { GenContentResponse, ScorePredictionType, ScorePredictioSchema, TeamNameType, TeamNameSchema } from "./interfaces";
import { SYSTEM_INSTRUCTIONS } from "./prompts";
import { ClubWorldCupTeams2025 } from "../bot/events/interactionCreate";
import { MatchType } from "../schemas/match";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const modelName = "gemini-2.0-flash";

export async function linkMatchScore(query: string, matches: [string, string][]): Promise<GenContentResponse<ScorePredictionType>> {
    const response = await ai.models.generateContent({
        model: modelName,
        config: {
            systemInstruction: SYSTEM_INSTRUCTIONS.FINAL_SCORE(
                matches.map(match => match.join(' vs. '))
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
                error: "​❌ No se encontró el partido. ¿Puedes ser un poco más exacto?"
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
      maxOutputTokens: 100,
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          team: {
            type: "string",
            enum: ClubWorldCupTeams2025
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

export async function linkMatch(query: string, matches: MatchType[]): Promise<GenContentResponse<MatchType>> {
    const response = await ai.models.generateContent({
        model: modelName,
        config: {
            systemInstruction: SYSTEM_INSTRUCTIONS.MATCH_MAPPING(
                matches.map(match => [match.team1,match.team2].join(' vs. '))
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

        const match = matches.find(
            match => match.team1 === jsonData.team1 && match.team2 === jsonData.team2
             || match.team1 === jsonData.team2 && match.team2 === jsonData.team1
        );
        if (!match) {
            return {
                success: false,
                error: "​❌ No se encontró el partido. ¿Puedes ser un poco más exacto?"
            }
        }

        return {
            success: true,
            data: match
        };
    } catch (e) {
        console.error(e);
        return {
            success: false,
            error: `Invalid JSON ${e}`
        }
    }
}