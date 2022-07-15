import { Uid } from "./Uid";
import { Vote } from "./Vote";

export interface Ballot {
    ballot_id:  number; //ID if ballot
    election_id: Uid; //ID of election ballot is cast in
    user_id?: Uid; //ID of user who cast ballot TODO: replace with voter ID
    status: string; //Status of string (saved, submitted)
    date_submitted: number; //time ballot was submitted, represented as unix timestamp (Date.now())
    ip_address?: string; // ip address if once_per_ip is enabled
    votes: Vote[];         // One per poll
    history?: BallotAction[];
}


export interface BallotAction {
    action_type:string;
    actor:Uid;
    timestamp:number;
}


export function ballotValidation(obj:Ballot): string | null {
    if (typeof obj.election_id !== 'string'){
        return "Invalid Election ID";
    }
    if (typeof obj.ballot_id !== 'number'){
        return "Invalid Ballot ID";
    }
    if (!obj.votes){
        return "Invalid Votes";
    }
    //TODO... etc
    return null;
  }