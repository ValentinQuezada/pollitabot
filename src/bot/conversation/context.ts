import { ScorePredictionType } from "../../gen/interfaces";
import { MatchType } from "../../schemas/match";

export interface ConversationMetadata {
    userId: string;
    startTime: Date;
    lastInteraction: Date;
    context: ConversationContext;
}

interface BaseContext {
    channelId: string;
    guildId: string | null;
    replyId: string;
}

export interface FixPredictionContext extends BaseContext {
    type: "fix-score-prediction";
    details: {
        match: MatchType;
        prediction: ScorePredictionType;
    }
}

export interface RemindMatchContext extends BaseContext {
    type: "remind-match";
    details: {
        matches: MatchType[];
    }
}

export type ConversationContext = FixPredictionContext | RemindMatchContext;