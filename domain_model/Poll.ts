import { Candidate } from "./Candidate";
import { Uid } from "./Uid";

export interface Poll {
    pollId: Uid; // short mnemonic for the poll
    title: string; // display caption for the poll
    description?: string; // mark-up text describing the poll
    candidates: Candidate[];
}