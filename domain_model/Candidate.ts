import { Uid } from "./Uid";

export interface Candidate {
    candidate_id:   Uid;
    candidate_name: string; // short mnemonic for the candidate
    full_name?:     string; // full name of the candidate
    bio?:           string; // mark-up text descripting the candidate
    party?:         string; // candidate affiliation
    party_url?:     string; // candidate affiliation url
    candidate_url?: string; // link to info about candidate
    partyUrl?:      string; // link to info about party
    photo_filename?:string; // link to info about party
  }