export interface ScorePrediction {
    team1: string;
    team2: string;
    score: {
        team1: number;
        team2: number;
    }
}

interface GenContentSuccessResponse<T> {
    success: true;
    data: T;
}

interface GenContentErrorResponse {
    success: false;
    error: string;
    data?: never;
}

export type GenContentResponse<T> = GenContentSuccessResponse<T> | GenContentErrorResponse;
