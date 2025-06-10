import mongoose from "mongoose";
import { MatchMongoose, MatchType } from "./schemas/match";

const MONGO_DB_CONNECTION_STRING = process.env.MONGO_DB_CONNECTION_STRING!;
let mongoClient: mongoose.Mongoose;
let mongoConnection: mongoose.Connection;

export async function databaseConnection(){
    console.log(MONGO_DB_CONNECTION_STRING)

    if (mongoConnection !== undefined) {
        return mongoConnection;
    }

    mongoClient = await mongoose.connect(MONGO_DB_CONNECTION_STRING);
    mongoConnection = mongoClient.connection;
    
    mongoConnection.once("open", () => {
        console.log("Connected to MongoDB");
        mongoConnection.model('Match', MatchMongoose); 
    })

    return mongoConnection;
}


export async function createMatch(match: MatchType) {
    const dbClient = await databaseConnection()
    const response = await dbClient.model("Match", MatchMongoose).create(match)
    return response;
}