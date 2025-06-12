export interface CompetitionData {
    Stages: Stage[];
}

export interface Stage {
    Sid:         string;
    Snm:         string;
    Scd:         string;
    GroupLetter?: string;
    hasDraw:     boolean;
    Events:      Event[];
}

export interface Event {
    Eid:         string;
    Tr1:         string; // Team 1 goals in 90 minutes
    Tr2:         string; // Team 2 goals in 90 minutes
    T1:          T1[];
    T2:          T1[];
    Eps:         Eps;
    ErnInf:      string;
    Esid:        number;
    Epr:         number;
    Ecov:        number;
    Esd:         number;
    LuUT:        number;
    Edf:         number;
    EO:          number;
    EOX:         number;
    Ehid:        number;
    seriesInfo?: SeriesInfo;
    Awt?:        number;
    Tr1ET?:      string; // Team 1 goals in extra time
    Tr2ET?:      string; // Team 2 goals in extra time
    Trp1?:       string; // Team 1 goals in penalties
    Trp2?:       string; // Team 2 goals in penalties
}

export enum Eps {
    Aet = "AET",
    Ap = "AP",
    Ft = "FT",
    NS = "NS",
}

export interface T1 {
    Nm:       string;
    ID:       string;
    Abr:      string;
    tbd:      number;
    Gd:       number;
    Pids:     { [key: string]: string[] };
    CoNm:     string; // Country Name
    CoId:     string; // Country ID (USA, PER)
}


export interface SeriesInfo {
    totalLegs:     number;
    currentLeg:    number;
    aggScoreTeam1: number;
    aggScoreTeam2: number;
}

