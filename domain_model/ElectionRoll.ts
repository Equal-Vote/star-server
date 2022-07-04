import { Uid } from "./Uid";
// Election roll contains information about the voter's ID and ballot status to ensure only
// authorized voters submit a single ballot
export interface ElectionRoll {
    election_roll_id: Uid; //unique primary key
    election_id: Uid; //ID of election ballot is cast in
    voter_id: Uid; //ID of voter who cast ballot
    ballot_id?:  Uid; //ID of ballot, unsure if this is needed
    submitted: boolean; //has ballot been submitted
    state: ElectionRollState; // 
    history?: ElectionRollAction[];
}

export interface ElectionRollAction {
    action_type:string;
    actor:Uid;
    timestamp:number;
}

export const ElectionStates = {}

export enum ElectionRollState {
    approved= 'approved',
    flagged = 'flagged',
    registered = 'registered',
    invalid = 'invalid'
}