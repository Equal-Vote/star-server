import { Uid } from "../../../domain_model/Uid";
import { ColumnType, Insertable, Selectable, Updateable } from 'kysely'

export interface ElectionRollTable {
    voter_id: Uid; //Unique ID of voter who cast ballot
    election_id: Uid; //ID of election ballot is cast in
    email?: string; // Email address of voter
    submitted: boolean; //has ballot been submitted
    ballot_id?: Uid; //ID of ballot, unsure if this is needed
    ip_address?: string; //IP Address of voter
    address?: string; // Address of voter
    state: ColumnType<ElectionRollState, string, string>; //state of election roll 
    history?: ColumnType<ElectionRollAction[], string, string>;// history of changes to election roll
    registration?: any; //Registration data for voter
    precinct?: string; // Precint of voter
    email_data?: ColumnType<{
        inviteResponse?: any,
        reminderResponse?: any,
    }, string, string>;
}

export interface ElectionRollAction {
    action_type: string;
    actor: Uid;
    timestamp: number;
}

export enum ElectionRollState {
    approved = 'approved',
    flagged = 'flagged',
    registered = 'registered',
    invalid = 'invalid'
}

export type NewElectionRoll = Insertable<ElectionRollTable>
export type UpdatedElectionRoll = Updateable<ElectionRollTable>
export type ElectionRoll = Selectable<ElectionRollTable>