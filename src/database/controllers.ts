import { CreateMatchType } from "../schemas/match";
import { MatchMongoose } from "../schemas/match";
import databaseConnection from "./connection";

export async function createMatch(match: CreateMatchType) {
    const dbClient = await databaseConnection();
    const response = await dbClient.model("Match", MatchMongoose).create(match)
    return response;
}