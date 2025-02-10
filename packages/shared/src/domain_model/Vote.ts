import { Score } from "./Score";
import { Uid } from "./Uid";

export interface Vote {
    race_id: Uid;        // Must match the pollId of the election
    scores: Score[];       // One per candidate
    overvote_rank?: number;
}

// this format is used in bulk uploads where the race/candidate order is mapped in a separate structure
// the final number (if present) will represent overvote_rank
export type OrderedVote = number[];