import { Election } from "./Election";
import { Race } from "./Race";
import { Uid } from "./Uid";
import { Vote } from "./Vote";

export interface Ballot {
    ballot_id:  Uid; //ID if ballot
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


export function ballotValidation(election: Election, obj:Ballot): string | null {
    if (!obj){
        return "Ballot is null";
    }
    //TODO - currently some disagreement on the type of the Election Id...
    //technically Uid expects a string, but the DB currently using numbers
    if (!obj.election_id || typeof obj.election_id !== 'string'){
        return "Invalid Election ID";
    }
    if (!obj.ballot_id || typeof obj.ballot_id !== 'string'){
        return "Invalid Ballot ID";
    }
    if (!obj.votes){
        return "Invalid Votes";
    }
    const race_ids = election.races.map((race: Race) => race.race_id)
    const ballot_race_ids = obj.votes.map((vote: Vote) => vote.race_id)
    const hasDuplicates = new Set(ballot_race_ids).size !== ballot_race_ids.length
    if (hasDuplicates) {
        return "Duplicate votes";
    }
    const validIds = ballot_race_ids.every(id => race_ids.includes(id))
    if (!validIds) {
        return "Invalid IDs";
    }

    return null;
  }