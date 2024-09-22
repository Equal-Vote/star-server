import { ballot, voter } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

// Functions to parse STAR scores
export interface IparsedData {
    scores: ballot[],
    invalidVotes: voter[],
    underVotes: number,
    validVotes: voter[]
} 
function getStarBallotValidity(ballot: ballot) {
    const minScore = 0
    const maxScore = 5
    let isUnderVote = true
    for (let i = 0; i < ballot.length; i++) {
        if (ballot[i] < minScore || ballot[i] > maxScore) {
            return { isValid: false, isUnderVote: false }
        }
        if (ballot[i] > minScore) {
            isUnderVote = false
        }
    }
    return { isValid: true, isUnderVote: isUnderVote }
}

export function ParseData(data: ballot[], validityCheck = getStarBallotValidity): IparsedData {
    // Initialize arrays
    const scores: ballot[] = [];
    const validVotes: voter[] = [];
    let underVotes: number = 0;
    const invalidVotes: voter[]  = [];
    // Parse each row of data into voter, undervote, and score arrays
    data.forEach((row, n) => {
        const voter: voter = { csvRow: n + 1 };
        const ballotValidity = validityCheck(row)
        if (!ballotValidity.isValid) {
            invalidVotes.push(voter)
        }
        else if (ballotValidity.isUnderVote) {
            underVotes += 1
            scores.push(row)
            validVotes.push(voter);
        }
        else {
            scores.push(row)
            validVotes.push(voter);
        }
    });
    return {
        scores,
        invalidVotes,
        underVotes,
        validVotes
    };
}

// export 