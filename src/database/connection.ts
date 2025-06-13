import mongoose from "mongoose";
import { MatchMongoose } from "../schemas/match";
import { PredictionSchema } from "../schemas/prediction";
import { UserStatsSchema } from "../schemas/user";
import { AwardMongoose } from "../schemas/award";
import { AuraPointsSchema } from "../schemas/aura";


let mongoClient: mongoose.Mongoose;
let mongoConnection: mongoose.Connection;

async function databaseConnection(){
    if (mongoConnection !== undefined) {
        return mongoConnection;
    }

    mongoClient = await mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING!);
    mongoConnection = mongoClient.connection;

    // Register all schemas here
    mongoConnection.model('Match', MatchMongoose);
    mongoConnection.model('Prediction', PredictionSchema);
    mongoConnection.model('UserStats', UserStatsSchema);
    mongoConnection.model('Award', AwardMongoose);
    mongoConnection.model('AuraPoints', AuraPointsSchema);

    mongoConnection.once("open", () => {
        console.log("Connected to MongoDB");
    });

    return mongoConnection;
}

export default databaseConnection;
