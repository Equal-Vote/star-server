import { Uid } from "./Uid";

export interface Score {
    candidateId: Uid;   // Must match the candidateId of the poll
    score: number;   // 0-5 integer value
}