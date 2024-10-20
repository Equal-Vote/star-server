import { ballot, candidate, irvResults, irvRoundResults, irvSummaryData, totalScore } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

import { IparsedData } from './ParseData'
// import Fraction from "fraction.js";
const ParseData = require("./ParseData");


const Fraction = require('fraction.js');

type weightedVote = {
    weight: typeof Fraction,
    vote: ballot,
    overvote: boolean
}

export function IRV(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder: number[] = [], breakTiesRandomly = true) {
    return IRV_STV(candidates, votes, nWinners, randomTiebreakOrder, breakTiesRandomly, false)
}

export function STV(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder: number[] = [], breakTiesRandomly = true) {
    return IRV_STV(candidates, votes, nWinners, randomTiebreakOrder, breakTiesRandomly, true)
}

export function IRV_STV(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder: number[] = [], breakTiesRandomly = true, proportional = true) {
    // Determines Instant Runoff winners for given election, results are either block or proportional
    // Parameters: 
    // candidates: Array of candidate names
    // votes: Array of votes, size nVoters x Candidates, zeros indicate no rank
    // nWiners: Number of winners in election, defaulted to 1 (only supports 1 at the moment)
    // randomTiebreakOrder: Array to determine tiebreak order, uses strings to allow comparing UUIDs. If empty or not same length as candidates, set to candidate indexes
    // breakTiesRandomly: In the event of a true tie, should a winner be selected at random, defaulted to true
    // proportional: Determines if results are block IRV or proportional STV

    // Parse the votes for valid, invalid, and undervotes, and identifies bullet votes
    const parsedData = ParseData(votes, getIRVBallotValidity)

    const summaryData = getSummaryData(candidates, parsedData, randomTiebreakOrder)

    // Initialize output data structure
    const results: irvResults = {
        elected: [],
        tied: [],
        other: [],
        summaryData: summaryData,
        roundResults: [],
        logs: [],
        voteCounts: [],
        exhaustedVoteCounts: [],
        overVoteCounts: [],
        tieBreakType: 'none',
    }

    

    let remainingCandidates = [...summaryData.candidates]
    let activeVotes: ballot[] = parsedData.scores
    let exhaustedVotes: weightedVote[] = []
    let exhaustedVoteCount = 0
    let overVoteCount = 0

    let weightedVotes: weightedVote[] = activeVotes.map(vote => ({ weight: Fraction(1), vote: vote, overvote: false }))

    // Initialize candidate vote pools to empty arrays
    let candidateVotes: weightedVote[][] = Array(summaryData.candidates.length)
    for (var i = 0; i < candidateVotes.length; i++) {
        candidateVotes[i] = [];
    }

    // Initial vote distribution, moves weighted votes into the appropriate candidate pools 
    distributeVotes(remainingCandidates, candidateVotes, exhaustedVotes, weightedVotes)

    // Set quota based on number of winners and if its proportional
    let quota = 0
    if (proportional) {
        quota = Math.floor(activeVotes.length/(nWinners + 1) + 1)
    }
    else {
        quota = Math.floor(activeVotes.length/2 + 1)
    }

    while (results.elected.length < nWinners) {

        let roundResults: irvRoundResults = {
            winners: [],
            eliminated: [],
            logs: []
        }

        let roundVoteCounts = candidateVotes.map((c, i) => ({ index: i, voteCount: addWeightedVotes(c) }))

        let sortedVoteCounts = [...roundVoteCounts].sort((a, b) => {
            if (a.voteCount !== b.voteCount) {
                return (b.voteCount - a.voteCount)
            }

            // break tie in favor of candidate with higher score in previous rounds
            for (let i = results.voteCounts.length - 1; i >= 0; i--) {
                if (results.voteCounts[i][b.index] !== results.voteCounts[i][a.index]) {
                    return results.voteCounts[i][b.index] - results.voteCounts[i][a.index]
                }
            }

            return (summaryData.candidates[a.index].tieBreakOrder - summaryData.candidates[b.index].tieBreakOrder)

        })

        results.voteCounts.push(roundVoteCounts.map(c => c.voteCount.valueOf()))
        results.exhaustedVoteCounts.push(exhaustedVotes.length)
        results.overVoteCounts.push(exhaustedVotes.filter(ev => ev.overvote).length)

        // get max number of votes
        let remainingCandidatesIndexes = remainingCandidates.map(c => c.index)

        let maxVotes = sortedVoteCounts[0].voteCount
        let nActiveVotes = candidateVotes.map(c => c.length).reduce((a, b) => a + b, 0)
        if (!proportional) {
            quota = Math.floor(nActiveVotes /2 + 1)
        }

        if (maxVotes >= quota) {
            // candidate meets the threshold
            // get index of winning candidate
            let winningCandidateIndex = sortedVoteCounts[0].index
            // add winner, remove from remaining candidates
            results.elected.push(summaryData.candidates[winningCandidateIndex])
            roundResults.winners.push(summaryData.candidates[winningCandidateIndex])
            if (proportional) {
                remainingCandidates = remainingCandidates.filter(c => !results.elected.includes(c))
                let fractionalSurplus = new Fraction(maxVotes - quota).div(maxVotes)
                let winningCandidateVotes = candidateVotes[winningCandidateIndex]
                candidateVotes[winningCandidateIndex] = []
                winningCandidateVotes.forEach(vote => {
                    vote.weight = vote.weight.mul(fractionalSurplus).floor(5)
                })
                distributeVotes(remainingCandidates, candidateVotes, exhaustedVotes, winningCandidateVotes)
            }
            else {
                // Reset candidate pool and remove elected candidates
                remainingCandidates = [...summaryData.candidates].filter(c => !results.elected.includes(c))

                // Reset candidate vote counts and redistribute votes
                for (var i = 0; i < candidateVotes.length; i++) {
                    candidateVotes[i] = [];
                }
                distributeVotes(remainingCandidates, candidateVotes, exhaustedVotes, weightedVotes)
            }

        }
        else if ( proportional && remainingCandidates.length <= (nWinners - results.elected.length)) {
            // If number of candidates remaining can fill seats, elect them and end election
            // Only used in proportional as order can matter in block 
            results.elected.push(...remainingCandidates)
            roundResults.winners.push(...remainingCandidates)
        }
        else {
            // find candidate with least votes and remove from remaining candidates
            let remainingVoteCounts = sortedVoteCounts.filter(c => remainingCandidatesIndexes.includes(c.index))
            let lastPlaceCandidateIndex = remainingVoteCounts[remainingVoteCounts.length - 1].index
            remainingCandidates = remainingCandidates.filter(c => c.index !== lastPlaceCandidateIndex)
            let eliminatedCandidateVotes = candidateVotes[lastPlaceCandidateIndex]
            candidateVotes[lastPlaceCandidateIndex] = []
            distributeVotes(remainingCandidates, candidateVotes, exhaustedVotes, eliminatedCandidateVotes)
            roundResults.eliminated.push(summaryData.candidates[lastPlaceCandidateIndex])
        }
        results.roundResults.push(roundResults)
    }

    return results
}

function addWeightedVotes(weightedVotes: weightedVote[]) {
    let voteTotal = new Fraction(0)
    weightedVotes.forEach(vote => {
        voteTotal = voteTotal.add(vote.weight)
    })
    return voteTotal
}



function distributeVotes(remainingCandidates: candidate[], candidateVotes: weightedVote[][], exhaustedVotes: weightedVote[], votesToDistribute: weightedVote[]) {
    for (let i = votesToDistribute.length - 1; i >= 0; i--) {
        // loop backwards over the ballots so exhausted votes can be removed
        let ballot = votesToDistribute[i]
        let topRemainingRank: number = 0
        let topRemainingRankIndex: number = 0
        let isOverVote = false
        remainingCandidates.forEach(candidate => {
            // loop over remaining candidates
            // find top (non-zero) rank, if duplicate top ranks mark as overvote
            if (ballot.vote[candidate.index] == 0) return;
            if (ballot.vote[candidate.index] == null) return;

            // candidate has rank

            if (topRemainingRank == 0) {
                // set initial top rank
                topRemainingRankIndex = candidate.index
                topRemainingRank = ballot.vote[candidate.index]
                isOverVote = false
            }
            else if (ballot.vote[candidate.index] < ballot.vote[topRemainingRankIndex]) {
                // set new top rank
                topRemainingRankIndex = candidate.index
                topRemainingRank = ballot.vote[candidate.index]
                isOverVote = false
            }
            else if (ballot.vote[candidate.index] === ballot.vote[topRemainingRankIndex]) {
                // multiple top ranks, mark as over vote
                isOverVote = true
            }
        })

        ballot.overvote = isOverVote

        if (topRemainingRank === 0 || isOverVote) {
            // ballot is exhausted
            exhaustedVotes.push(ballot)
        }
        else {
            // give vote to top rank candidate
            candidateVotes[topRemainingRankIndex].push(ballot)
        }
    }


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

function getSummaryData(candidates: string[], parsedData: IparsedData, randomTiebreakOrder: number[]): irvSummaryData {
    const nCandidates = candidates.length
    if (randomTiebreakOrder.length < nCandidates) {
        randomTiebreakOrder = candidates.map((c, index) => index)
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

    const candidatesWithIndexes: candidate[] = candidates.map((candidate, index) => ({ index: index, name: candidate, tieBreakOrder: randomTiebreakOrder[index] }))
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