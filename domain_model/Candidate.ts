import { Uid } from "./Uid";

export interface Candidate {
    candidateId:   Uid;
    shortName:     string; // short mnemonic for the candidate
    fullName:      string; // full name of the candidate
    party?:        string; // candidate affiliation
    candidateUrl?: string; // link to info about candidate
    partyUrl?:     string; // link to info about party
    bio?:          string; // mark-up text descripting the candidate
  }