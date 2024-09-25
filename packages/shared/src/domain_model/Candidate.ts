import { Uid } from "./Uid";
import { urlRegex } from "./Util";
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
export function candidateValidation(obj:Candidate):string | null {
  if (!obj.candidate_id || typeof obj.candidate_id !== 'string') {
    return "Invalid Candidate Id";
}
if (typeof obj.candidate_name !== 'string'){
    return "Invalid Name";
}
if ((obj.candidate_name.length < 3 || obj.candidate_name.length > 256)) {
    return "invalid Name length";
}
if (obj.full_name && typeof obj.full_name !== 'string'){
    return "Invalid Full Name";
}
if (obj.bio && typeof obj.bio !== 'string'){
    return "Invalid Bio";
}
if (obj.party && typeof obj.party !== 'string'){
    return "Invalid Party";
}
if (obj.party_url && !urlRegex.test(obj.party_url)){
    return "Invalid Party URL";
}
if (obj.candidate_url && !urlRegex.test(obj.candidate_url)){
    return "Invalid Candidate URL";
}
if (obj.partyUrl && !urlRegex.test(obj.partyUrl)){
    return "Invalid Party URL";
}
if (obj.photo_filename && typeof obj.photo_filename !== 'string'){
    return "Invalid Photo Filename";
}
  return null;
}
