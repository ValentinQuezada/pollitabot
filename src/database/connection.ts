import mongoose from "mongoose";
import { MONGO_DB_CONNECTION_STRING } from "../constant/credentials";
import { MatchMongoose } from "../schemas/match";

let mongoClient: mongoose.Mongoose;
let mongoConnection: mongoose.Connection;

async function databaseConnection(){
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

export default databaseConnection;
