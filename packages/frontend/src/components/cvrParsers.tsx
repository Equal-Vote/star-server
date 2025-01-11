import { NewBallotWithVoterID } from "@equal-vote/star-vote-shared/domain_model/Ballot";

/* 
    Example Input (assuming papa parse)

    {
        data: [
           {ballotID: 7, ward: 400, rank1: 'Terry Seamens', rank2: 'Terry Seamens'} ,
           {ballotID: 8, ward: 400, rank1: 'Terry Seamens', rank2: 'skipped'},
           ...
        ],
        meta: [fields: ['ballotID', 'ward', 'rank1', 'rank2']]
        errors:[{
            code: "TooFewFields"
            message: "Too few fields: expected 4 fields but parsed 1"
            row: 576
            type: "FieldMismatch"
        }]
    }
*/

//const parseCSV = (text : string) => {
//    console.log(CSV.parse(text));
//}

// ported from https://github.com/fairvotereform/rcv_cruncher/blob/9bb9f8482290033ff7b31d6b091186474e7afff6/src/rcv_cruncher/parsers.py
export const rankColumnCSV = ({data, meta, errors}, election) : {output: NewBallotWithVoterID[], errors:object[]} => {
    const fields = meta.fields;

    let output = data.map((row,i) => {

export interface Ballot {
    election_id: Uid; //ID of election ballot is cast in
    status: string; //Status of string (saved, submitted)
    date_submitted: number; //time ballot was submitted, represented as unix timestamp (Date.now())
    votes: Vote[];         // One per poll
}
export interface Vote {
    race_id: Uid;        // Must match the pollId of the election
    scores: Score[];       // One per candidate
}
        return {
            voter_id: i,
            ballot: {
                election_id: election_id,
                status: 'submitted',
                date_submitted: Date.now(),
                votes: []
            }
        }
    })

    return {
        output: [],
        errors: []
    };
}