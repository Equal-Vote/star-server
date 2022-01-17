import { Candidate } from "./Candidate";
import { Uid } from "./Uid";

export interface Poll {
    pollId: Uid; // short mnemonic for the poll
    title: string; // display caption for the poll
    description?: string; // mark-up text describing the poll
    voting_method: string; //voting method to be used
    num_winners: number; // number of winners
    candidates: Candidate[]; // list of candidates
}