import { Candidate } from "./Candidate";
import { Uid } from "./Uid";

export interface Race {
    race_id:        Uid; // short mnemonic for the race
    title:          string; // display caption for the race
    description?:   string; // mark-up text describing the race
    voting_method:  string; //voting method to be used
    num_winners:    number; // number of winners
    candidates:     Candidate[]; // list of candidates
    precincts?:     String[]; // list of precincts that vote in this election, if null then open to all precincts
}