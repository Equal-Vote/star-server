import { Uid } from "./Uid";

export interface Score {
    candidate_id: Uid;   // Must match the candidate_id of the poll
    score: number;   // 0-5 integer value
}