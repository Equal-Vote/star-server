import { ElectionSettings } from "./ElectionSettings";
import { Race } from "./Race";
import { Uid } from "./Uid";

export interface Election {
    election_id:    Uid; // identifier assigned by the system
    title:          string; // one-line election title
    description?:   string; // mark-up text describing the election
    frontend_url:   string; // base URL for the frontend
    start_time?:    Date;   // when the election starts 
    end_time?:      Date;   // when the election ends
    support_email?: string; // email available to voters to request support
    owner_id:       Uid;  // user_id of owner of election
    audit_id?:      Uid;  // user_id of account with audit access
    admin_id?:      Uid;  // user_id of account with admin access
    state:          string; // State of election, In development, finalized, etc
    races:          Race[]; // one or more race definitions
    settings?:      ElectionSettings;
  }