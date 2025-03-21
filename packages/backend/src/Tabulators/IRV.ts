import { ballot, candidate, irvResults, irvRoundResults, irvSummaryData, nonNullBallot } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

import { getInitialData, makeAbstentionTest, makeBoundsTest } from "./Util";
import { ElectionSettings } from "@equal-vote/star-vote-shared/domain_model/ElectionSettings";
import { Election } from "@equal-vote/star-vote-shared/domain_model/Election";

const Fraction = require('fraction.js');

type weightedVote = {
    weight: typeof Fraction,
    vote: nonNullBallot,
}

export function IRV(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder: number[] = [], breakTiesRandomly = true, electionSettings?:ElectionSettings) {
    return IRV_STV(candidates, votes, nWinners, randomTiebreakOrder, breakTiesRandomly, electionSettings, false)
}

export function STV(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder: number[] = [], breakTiesRandomly = true, electionSettings?:ElectionSettings) {
    return IRV_STV(candidates, votes, nWinners, randomTiebreakOrder, breakTiesRandomly, electionSettings, true)
}

export function IRV_STV(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder: number[] = [], breakTiesRandomly = true, electionSettings?:ElectionSettings, proportional = true) {

    const [tallyVotes, summaryData] = getInitialData<Omit<irvSummaryData, 'nExhaustedViaOverVote' | 'nExhaustedViaSkippedRank' | 'nExhaustedViaDuplicateRank'>>(
		votes, candidates, randomTiebreakOrder, 'ordinal',
		[
			makeBoundsTest(0, electionSettings?.max_rankings ?? Infinity), 
			makeAbstentionTest(null),
		]
	);

    // Initialize output data structure
    const results: irvResults = {
        votingMethod: proportional? 'STV' : 'IRV',
        elected: [],
        tied: [],
        other: [],
        summaryData: summaryData,
        roundResults: [],
        logs: [],
        voteCounts: [],
        exhaustedVoteCounts: [],
        tieBreakType: 'none',
        nExhaustedViaOvervote: 0,
        nExhaustedViaSkippedRank: 0,
        nExhaustedViaDuplicateRank: 0,
    }

    let remainingCandidates = [...summaryData.candidates]
    let activeVotes: nonNullBallot[] = tallyVotes;
    let exhaustedVotes: weightedVote[] = []

    let weightedVotes: weightedVote[] = activeVotes.map(vote => ({ weight: Fraction(1), vote: vote }))

    // Initialize candidate vote pools to empty arrays
    let candidateVotes: weightedVote[][] = Array(summaryData.candidates.length)
    for (var i = 0; i < candidateVotes.length; i++) {
        candidateVotes[i] = [];
    }

    // Initial vote distribution, moves weighted votes into the appropriate candidate pools 
    distributeVotes(remainingCandidates, candidateVotes, exhaustedVotes, weightedVotes, results, electionSettings)

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
                distributeVotes(remainingCandidates, candidateVotes, exhaustedVotes, winningCandidateVotes, results, electionSettings)
            }
            else {
                // Reset candidate pool and remove elected candidates
                remainingCandidates = [...summaryData.candidates].filter(c => !results.elected.includes(c))

                // Reset candidate vote counts and redistribute votes
                for (var i = 0; i < candidateVotes.length; i++) {
                    candidateVotes[i] = [];
                }
                distributeVotes(remainingCandidates, candidateVotes, exhaustedVotes, weightedVotes, results, electionSettings)
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
            distributeVotes(remainingCandidates, candidateVotes, exhaustedVotes, eliminatedCandidateVotes, results, electionSettings)
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



function distributeVotes(remainingCandidates: candidate[], candidateVotes: weightedVote[][], exhaustedVotes: weightedVote[], votesToDistribute: weightedVote[], results: irvResults, electionSettings?: ElectionSettings) {
    // we'll remove as votes get exhausted, hence the backwards iteration
    for(let i = votesToDistribute.length-1; i >= 0; i--){
        let ballot = votesToDistribute[i];
        // it's important to include the overvote_index at the end so that it over take presedent over other markings
        let overvoteIndex = ballot.vote.length-1;
        let topRemainingRankIndex = [...remainingCandidates.map(c => c.index), overvoteIndex].reduce((topRankIndex, candidateIndex) => {
            // no need for null check since weightedVote uses a nonNullBallot
            if(ballot.vote[candidateIndex] == 0) return topRankIndex;
            if(ballot.vote[topRankIndex] != 0 && ballot.vote[candidateIndex] == ballot.vote[topRankIndex]) return overvoteIndex;
            return ballot.vote[topRankIndex] == 0 || ballot.vote[candidateIndex] < ballot.vote[topRankIndex] ? candidateIndex : topRankIndex;
        })
        let topRemainingRank: number = ballot.vote[topRemainingRankIndex]

        let prevTopRank = ballot.vote.reduce((prevTopRank, curRank) => {
            if(curRank == 0 || curRank >= topRemainingRank) return prevTopRank;
            return Math.max(prevTopRank, curRank);
        }, 0)

        // TODO: get "2" from election settings
        let exhaustedViaSkippedRankings = (topRemainingRank - prevTopRank) > (electionSettings?.exhaust_on_N_repeated_skipped_marks ?? 9999);
        let exhaustedViaOvervote = !exhaustedViaSkippedRankings && topRemainingRankIndex == overvoteIndex;
        if (topRemainingRank === 0 || exhaustedViaOvervote || exhaustedViaSkippedRankings) {
            if(exhaustedViaSkippedRankings) results.nExhaustedViaSkippedRank++;
            if(exhaustedViaOvervote) results.nExhaustedViaOvervote++;

            // ballot is exhausted
            exhaustedVotes.push(ballot)
            votesToDistribute.splice(i,1);
        }
        else {
            // give vote to top rank candidate
            candidateVotes[topRemainingRankIndex].push(ballot)
        }
    }
}