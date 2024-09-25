import { Election, PartialBy, getApprovedRaces } from "./Election";
import { ElectionRoll } from "./ElectionRoll";
import { Race } from "./Race";
import { Uid } from "./Uid";
import { Vote } from "./Vote";

export interface Ballot {
    ballot_id:  Uid; //ID if ballot
    election_id: Uid; //ID of election ballot is cast in
    user_id?: Uid; //ID of user who cast ballot TODO: replace with voter ID
    status: string; //Status of string (saved, submitted)
    date_submitted: number; //time ballot was submitted, represented as unix timestamp (Date.now())
    ip_hash?: string; // ip address if once_per_ip is enabled
    votes: Vote[];         // One per poll
    history?: BallotAction[];
    precinct?: string; // Precint of voter
    create_date:    Date | string; // Date this object was created
    update_date:    Date | string;  // Date this object was last updated
    head:           boolean;// Head version of this object
}

export interface AnonymizedBallot {
    ballot_id:  string; //ID of ballot
    votes: Vote[];         // One per poll
}

export interface BallotAction {
    action_type:string;
    actor:Uid;
    timestamp:number;
}

export interface NewBallot extends PartialBy<Ballot,'ballot_id'|'create_date'|'update_date'|'head'> {}

export function ballotValidation(election: Election, obj:Ballot): string | null {
    if (!obj){
        return "Ballot is null";
    }
    //TODO - currently some disagreement on the type of the Election Id...
    //technically Uid expects a string, but the DB currently using numbers
    if (!obj.election_id || typeof obj.election_id !== 'string'){
        return "Invalid Election ID";
    }
    if (!obj.votes){
        return "Invalid Votes";
    }
    const approvedRaces = getApprovedRaces(election, obj.precinct)
    const approvedRaceIds = approvedRaces.map((race: Race) => race.race_id)
    const ballotRaceIds = obj.votes.map((vote: Vote) => vote.race_id)
    const hasDuplicates = new Set(ballotRaceIds).size !== ballotRaceIds.length
    // Checks if ballot has duplicate votes for the same race
    if (hasDuplicates) {
        return "Duplicate votes";
    }

    // Checks that all race ids on voter's ballot are in list of races that voter is allowed to vote in
    const validIds = ballotRaceIds.every(id => approvedRaceIds.includes(id))
    if (!validIds) {
        return "Invalid IDs";
    }
    const maxRankings = election.settings.max_rankings
    
    const racesWithScoresOutOfBounds = approvedRaces.filter(race => {
    //Checks if the score exceeds max_rankings or number of candidates for ranked elections
        if (['RankedRobin', 'IRV', 'STV'].includes(race.voting_method)) {
            const numCandidates = race.candidates.length;
            return obj.votes.some(vote => {
                return vote.scores.some(score => {
                    if (score.score > numCandidates || (maxRankings && score.score > maxRankings) || score.score < 1) {
                        return true;
                    }
                })
            })
        //Checks if the score exceeds 5 for STAR and STAR_PR elections
        } else if ([ 'STAR', 'STAR_PR'].includes(race.voting_method)) {
            return obj.votes.some(vote => {
                return vote.scores.some(score => {
                    if (score.score > 5 || score.score < 0) {
                        return true;
                    }
                })
            })
        //Checks if the score exceeds 1 for Approval and Plurality elections
        } else if (['Approval', 'Plurality'].includes(race.voting_method)) {
            return obj.votes.some(vote => {
                return vote.scores.some(score => {
                    if (score.score > 1 || score.score < 0) {
                        return true;
                    }
                })
            })
        }
    }).map(race => race.race_id)
    if (racesWithScoresOutOfBounds.length > 0) {
        return "The following races have scores that are out of bounds: " + racesWithScoresOutOfBounds.toString();
    }
    return null;
  }
