import { ElectionSettings } from "./ElectionSettings";
import { Race } from "./Race";
import { Uid } from "./Uid";

export interface Election {
    election_id:    number; // identifier assigned by the system
    title:          string; // one-line election title
    description?:   string; // mark-up text describing the election
    frontend_url:   string; // base URL for the frontend
    start_time?:    Date;   // when the election starts 
    end_time?:      Date;   // when the election ends
    support_email?: string; // email available to voters to request support
    owner_id:       Uid;  // user_id of owner of election
    audit_ids?:     Uid[];  // user_id of account with audit access
    admin_ids?:     Uid[];  // user_id of account with admin access
    credential_ids?:Uid[];  // user_id of account with credentialling access
    state:          string; // State of election, In development, finalized, etc
    races:          Race[]; // one or more race definitions
    settings:      ElectionSettings;
  }

  
export function electionValidation(obj:Election): string | null {
  if (!obj){
    return "Election is null";
  }
  if (typeof obj.election_id !== 'number'){
      return "Invalid Election ID";
  }
  if (typeof obj.title !== 'string'){
      return "Invalid Title";
  }
  if (obj.title.length < 3 || obj.title.length > 256){
    return "invalid Title length";
  }
  //TODO... etc
  return null;
}