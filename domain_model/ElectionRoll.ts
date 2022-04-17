import { Uid } from "./Uid";

export interface ElectionRoll {
    election_roll_id: Uid; //unique primary key
    election_id: Uid; //ID of election ballot is cast in
    voter_id: Uid; //ID of voter who cast ballot
    ballot_id?:  Uid; //ID of ballot, unsure if this is needed
    submitted: boolean; //has ballot been submitted
}