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

