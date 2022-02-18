import { Score } from "./Score";
import { Uid } from "./Uid";

export interface Vote {
    race_id: Uid;        // Must match the pollId of the election
    scores: Score[];       // One per candidate
}