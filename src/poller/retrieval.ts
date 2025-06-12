import axios from "axios";
import { CompetitionData } from "../schemas/poller";
import { SCORE_MATCHES_DATE } from "../constant/urls";

// YYYY-MM-DD
const formatPollerURL = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);
    return SCORE_MATCHES_DATE.replace('${date}', `${year}${month}${day}`);
}

async function obtainData(date: string) {
    const endpoint = formatPollerURL(date);
    const response = await axios.get(endpoint);
    return response.data as CompetitionData;
}

async function extractPreviewData(data: CompetitionData) {
    const WorldCup = data.Stages
    .filter(stage => stage.Scd.includes("fifa-club-world-cup-group-"))
    .map(stage => ({
        ...stage,
        GroupLetter: stage.Scd[stage.Scd.length - 1]
    }));
    
    return WorldCup;
}