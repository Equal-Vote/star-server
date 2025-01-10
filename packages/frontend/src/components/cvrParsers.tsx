import { NewBallotWithVoterID } from "@equal-vote/star-vote-shared/domain_model/Ballot";
import * as CSV from 'csv-string';

const parseCSV = (text : string) => {
    console.log(CSV.parse(text));
}

// ported from https://github.com/fairvotereform/rcv_cruncher/blob/9bb9f8482290033ff7b31d6b091186474e7afff6/src/rcv_cruncher/parsers.py
export const rankColumnCSV = (text: string) : NewBallotWithVoterID[] => {
    parseCSV(text);
    return [];
}