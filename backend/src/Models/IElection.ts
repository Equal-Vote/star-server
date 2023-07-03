import { ElectionSettings } from "../../../domain_model/ElectionSettings";
import { Race } from "../../../domain_model/Race";
import { Uid } from "../../../domain_model/Uid";
import { ColumnType, Insertable, Selectable, Updateable } from 'kysely'

export interface ElectionTable {
    election_id:    Uid; // identifier assigned by the system
    title:          string; // one-line election title
    description?:   string; // mark-up text describing the election
    frontend_url:   string; // base URL for the frontend
    start_time?:    Date | string;   // when the election starts 
    end_time?:      Date | string;   // when the election ends
    support_email?: string; // email available to voters to request support
    owner_id:       Uid;  // user_id of owner of election
    audit_ids?:     ColumnType<Uid[],string,string>;  // user_id of account with audit access
    admin_ids?:     ColumnType<Uid[],string,string>;  // user_id of account with admin access
    credential_ids?:ColumnType<Uid[],string,string>;  // user_id of account with credentialling access
    state:          'draft' | 'finalized' | 'open' | 'closed' | 'archived'; // State of election, In development, finalized, etc
    races:          ColumnType<Race[],string,string>; // one or more race definitions
    settings:       ColumnType<ElectionSettings,string,string>;
    auth_key?:      string;
  }

  export type NewElection = Insertable<ElectionTable>
  export type UpdatedElection = Updateable<ElectionTable>
  export type Election = Selectable<ElectionTable>