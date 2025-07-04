import { CreateMatchType, MatchDocument } from "../schemas/match";
import { MatchMongoose } from "../schemas/match";
import { CreateAwardType, AwardDocument } from "../schemas/award";
import { AwardMongoose } from "../schemas/award";
import databaseConnection from "./connection";

// Crear un Match
export async function createMatch(match: CreateMatchType) {
    const dbClient = await databaseConnection();
    const response = await dbClient.model<MatchDocument>("Match", MatchMongoose).create(match);
    return response;
}

// Recuperar Matches
export async function retrieveMatches(
    filter: any = { isFinished: false }, 
    select: any = {team1: 1, team2: 1, datetime: 1, _id: 1, matchType: 1, hasStarted: 1, isFinished: 1, fee: 1, allowedToBet: 1},
    limit: number = 80,
    sortBy: any = {datetime: 1}
) {
    const dbClient = await databaseConnection();
    const response = await dbClient.model<MatchDocument>("Match", MatchMongoose)
        .find(filter)
        .select(select)
        .limit(limit)
        .sort(sortBy);
    return response;
}

// Crear un Award
export async function createAward(award: CreateAwardType) {
    const dbClient = await databaseConnection();
    const response = await dbClient.model<AwardDocument>("Award", AwardMongoose).create(award);
    return response;
}

// Recuperar Awards
export async function retrieveAwards(
    filter: any = {}, 
    select: any = {name: 1, result: 1, _id: 1},
    limit: number = 10,
    sortBy: any = {createdAt: 1}
) {
    const dbClient = await databaseConnection();
    const response = await dbClient.model<AwardDocument>("Award", AwardMongoose)
        .find(filter)
        .select(select)
        .limit(limit)
        .sort(sortBy);
    return response;
}
