import { ballot, candidate, irvResults, irvSummaryData, totalScore } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

import { IparsedData } from './ParseData'
const ParseData = require("./ParseData");

export function IRV(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder:number[] = [], breakTiesRandomly = true) {
    // Determines Instant Runoff winners for given election
    // Parameters: 
    // candidates: Array of candidate names
    // votes: Array of votes, size nVoters x Candidates, zeros indicate no rank
    // nWiners: Number of winners in election, defaulted to 1 (only supports 1 at the moment)
    // randomTiebreakOrder: Array to determine tiebreak order, uses strings to allow comparing UUIDs. If empty or not same length as candidates, set to candidate indexes
    // breakTiesRandomly: In the event of a true tie, should a winner be selected at random, defaulted to true

    // Parse the votes for valid, invalid, and undervotes, and identifies bullet votes
    const parsedData = ParseData(votes, getIRVBallotValidity)

    const summaryData = getSummaryData(candidates, parsedData, randomTiebreakOrder)

    // Initialize output data structure
    const results: irvResults = {
        elected: [],
        tied: [],
        other: [],
        summaryData: summaryData,
        logs: [],
        voteCounts: [],
        exhaustedVoteCounts: [],
        overVoteCounts: [],
        tieBreakType: 'none',
    }

    let remainingCandidates = [...summaryData.candidates]
    let activeVotes = parsedData.scores
    let exhaustedVotes: ballot[] = []
    let exhaustedVoteCount = 0
    let overVoteCount = 0
    while (results.elected.length < 1) { //TODO: multiwinner STV
        let roundVoteCounts = Array(summaryData.candidates.length).fill(0)
        for (let i = activeVotes.length - 1; i >= 0; i--) {
            // loop backwards over the ballots so exhausted votes can be removed
            let ballot = activeVotes[i]
            let topRemainingRank: number = 0
            let topRemainingRankIndex: number = 0
            let isOverVote = false
            remainingCandidates.forEach(candidate => {
                // loop over remaining candidates
                // find top (non-zero) rank, if duplicate top ranks mark as overvote
                if (ballot[candidate.index] !== 0) {
                    // candidate has rank

                    if (topRemainingRank == 0) {
                        // set initial top rank
                        topRemainingRankIndex = candidate.index
                        topRemainingRank = ballot[candidate.index]
                        isOverVote = false
                    }
                    else if (ballot[candidate.index] < ballot[topRemainingRankIndex]) {
                        // set new top rank
                        topRemainingRankIndex = candidate.index
                        topRemainingRank = ballot[candidate.index]
                        isOverVote = false
                    }
                    else if (ballot[candidate.index] === ballot[topRemainingRankIndex]) {
                        // multiple top ranks, mark as over vote
                        isOverVote = true
                    }
                }
            })
            if (isOverVote) {
                // ballot is overvote
                overVoteCount += 1
            }
            if (topRemainingRank === 0 || isOverVote) {
                // ballot is exhausted
                exhaustedVoteCount += 1
                exhaustedVotes.push(...activeVotes.splice(i, 1))
            }
            else {
                // give vote to top rank candidate
                roundVoteCounts[topRemainingRankIndex] += 1
            }
        }
        results.voteCounts.push(roundVoteCounts)
        results.exhaustedVoteCounts.push(exhaustedVoteCount)
        results.overVoteCounts.push(overVoteCount)
        let voteThreshold = activeVotes.length / 2

        // get max number of votes
        let remainingCandidatesIndexes = remainingCandidates.map(c => c.index)
        let maxVotes = Math.max(...roundVoteCounts.filter((c, i) => remainingCandidatesIndexes.includes(i)))
        if (maxVotes > voteThreshold || remainingCandidates.length <= 2) {
            // candidate meets the threshold
            // get index of winning candidate
            let winningCandidateIndex = roundVoteCounts.indexOf(maxVotes)
            // add winner, remove from remaining candidates
            results.elected.push(summaryData.candidates[winningCandidateIndex])
            remainingCandidates = remainingCandidates.filter(c => !results.elected.includes(c))
            // TODO: Some STV stuff
        }
        else {
            // find candidate with least votes and remove from remaining candidates
            let remainingVoteCounts = roundVoteCounts.filter((c, i) => remainingCandidatesIndexes.includes(i))
            let lastPlaceCandidateIndex = remainingVoteCounts.indexOf(Math.min(...remainingVoteCounts))
            remainingCandidates = remainingCandidates.filter(c => c !== summaryData.candidates[remainingCandidatesIndexes[lastPlaceCandidateIndex]])
        }
    }
    // Sort data in order of candidate placements
    // results.summaryData = sortData(summaryData, results.elected.concat(results.tied).concat(results.other))
    return results
}

function getIRVBallotValidity(ballot: ballot) {
    const minScore = 0
    const maxScore = ballot.length
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

function getSummaryData(candidates: string[], parsedData: IparsedData, randomTiebreakOrder:number[]): irvSummaryData {
    const nCandidates = candidates.length 
    if (randomTiebreakOrder.length < nCandidates) {
        randomTiebreakOrder = candidates.map((c,index) => index)
      }
    // Initialize summary data structures
    // Total scores for each candidate, includes candidate indexes for easier sorting
    const totalScores: totalScore[] = Array(nCandidates)
    for (let i = 0; i < nCandidates; i++) {
        totalScores[i] = { index: i, score: 0 };
    }

    // Score histograms for data analysis
    const rankHist: number[][] = Array(nCandidates);
    for (let i = 0; i < nCandidates; i++) {
        rankHist[i] = Array(nCandidates).fill(0);
    }

    // Matrix for voter preferences
    const preferenceMatrix: number[][] = Array(nCandidates);
    const pairwiseMatrix: number[][] = Array(nCandidates);
    for (let i = 0; i < nCandidates; i++) {
        preferenceMatrix[i] = Array(nCandidates).fill(0);
        pairwiseMatrix[i] = Array(nCandidates).fill(0);
    }
    let nBulletVotes = 0

    // Iterate through ballots and populate data structures
    parsedData.scores.forEach((vote) => {
        let nSupported = 0
        for (let i = 0; i < nCandidates; i++) {
            let iRank = vote[i]
            if (iRank === 0) {
                iRank = nCandidates
            }
            rankHist[i][iRank - 1] += 1
            for (let j = 0; j < nCandidates; j++) {

                let jRank = vote[j]
                if (jRank === 0) {
                    jRank = nCandidates
                }
                if (i !== j) {
                    if (iRank < jRank) {
                        preferenceMatrix[i][j] += 1
                    }
                }
            }
            if (vote[i] > 0) {
                nSupported += 1
            }
        }
        if (nSupported === 1) {
            nBulletVotes += 1
        }
    })

    for (let i = 0; i < nCandidates; i++) {
        for (let j = 0; j < nCandidates; j++) {
            if (preferenceMatrix[i][j] > preferenceMatrix[j][i]) {
                pairwiseMatrix[i][j] = 1
                totalScores[i].score += 1
            }
        }
    }

    const candidatesWithIndexes: candidate[] = candidates.map((candidate, index) => ({ index: index, name: candidate, tieBreakOrder: randomTiebreakOrder[index]}))
    return {
        candidates: candidatesWithIndexes,
        totalScores,
        rankHist,
        preferenceMatrix,
        pairwiseMatrix,
        nValidVotes: parsedData.validVotes.length,
        nInvalidVotes: parsedData.invalidVotes.length,
        nUnderVotes: parsedData.underVotes,
        nBulletVotes: nBulletVotes
    }
}

function sortData(summaryData: irvSummaryData, order: candidate[]): irvSummaryData {
    // sorts summary data to be in specified order
    const indexOrder = order.map(c => c.index)
    const candidates = indexOrder.map(ind => (summaryData.candidates[ind]))
    candidates.forEach((c, i) => {
        c.index = i
    })
    const totalScores = indexOrder.map((ind, i) => ({ index: i, score: summaryData.totalScores[ind].score }))
    const rankHist = indexOrder.map((ind) => summaryData.rankHist[ind])
    const preferenceMatrix = sortMatrix(summaryData.preferenceMatrix, indexOrder)
    const pairwiseMatrix = sortMatrix(summaryData.pairwiseMatrix, indexOrder)
    return {
        candidates,
        totalScores,
        rankHist,
        preferenceMatrix,
        pairwiseMatrix,
        nValidVotes: summaryData.nValidVotes,
        nInvalidVotes: summaryData.nInvalidVotes,
        nUnderVotes: summaryData.nUnderVotes,
        nBulletVotes: summaryData.nBulletVotes,
    }
}

function sortMatrix(matrix: number[][], order: number[]) {
    var newMatrix = Array(order.length);
    for (let i = 0; i < order.length; i++) {
        newMatrix[i] = Array(order.length).fill(0);
    }
    order.forEach((i, iInd) => {
        order.forEach((j, jInd) => {
            newMatrix[iInd][jInd] = matrix[i][j];
        });
    });
    return newMatrix
}