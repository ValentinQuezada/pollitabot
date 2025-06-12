import { CreateMatchType, MatchDocument } from "../schemas/match";
import { MatchMongoose } from "../schemas/match";
import databaseConnection from "./connection";

export async function createMatch(match: CreateMatchType) {
    const dbClient = await databaseConnection();
    const response = await dbClient.model("Match", MatchMongoose).create(match)
    return response;
}

export async function retrieveMatches(
    filter: any = { isFinished: false }, 
    select: any = {team1: 1, team2: 1, _id: 1},
    limit: number = 50,
    sortBy: any = {datetime: 1}
) {
    const dbClient = await databaseConnection();
    const response = await dbClient.model("Match", MatchMongoose).find(filter).select(select).limit(limit).sort(sortBy);
    return response;
}