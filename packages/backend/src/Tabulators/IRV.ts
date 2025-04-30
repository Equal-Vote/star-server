import { candidate, irvCandidate, irvResults, irvRoundResults, irvSummaryData, keyedObject, rawVote, vote } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

import { getSummaryData, makeAbstentionTest, makeBoundsTest } from "./Util";
import { ElectionSettings } from "@equal-vote/star-vote-shared/domain_model/ElectionSettings";

const Fraction = require('fraction.js');

const DEBUG = false;

type weightedVote = {
    weight: typeof Fraction,
    vote: vote,
}

type candidateVotes = {
    votes: weightedVote[],
    candidate: irvCandidate
}

export function IRV(candidates: candidate[], votes: rawVote[], nWinners = 1, electionSettings?:ElectionSettings) {
    return IRV_STV(candidates, votes, nWinners, electionSettings, false)
}

export function STV(candidates: candidate[], votes: rawVote[], nWinners = 1, electionSettings?:ElectionSettings) {
    return IRV_STV(candidates, votes, nWinners, electionSettings, true)
}

export function IRV_STV(candidates: candidate[], votes: rawVote[], nWinners = 1, electionSettings?:ElectionSettings, proportional = true) {

    const {tallyVotes, summaryData} = getSummaryData<irvCandidate, Omit<irvSummaryData, 'nExhaustedViaOverVote' | 'nExhaustedViaSkippedRank' | 'nExhaustedViaDuplicateRank'>>(
        candidates.map(c => ({...c, firstRankCount: 0})), 
		votes,
        'ordinal',
        proportional? undefined : 'firstRankCount',
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
        voteCounts: [],
        exhaustedVoteCounts: [],
        tieBreakType: 'none',
        nExhaustedViaOvervote: 0,
        nExhaustedViaSkippedRank: 0,
        nExhaustedViaDuplicateRank: 0,
    }

    let remainingCandidates = [...summaryData.candidates]
    let activeVotes: vote[] = tallyVotes;

    let weightedVotes: weightedVote[] = activeVotes.map(vote => ({ weight: Fraction(1), vote: vote }))

    // Initialize candidate vote pools to empty arrays
    let candidateVotes: keyedObject<candidateVotes> = Object.fromEntries(summaryData.candidates.map(c => [c.id, {
        candidate: c, 
        votes: [] as weightedVote[]
    }]))

    // Initial vote distribution, moves weighted votes into the appropriate candidate pools 
    distributeVotes(remainingCandidates, candidateVotes, weightedVotes, results, electionSettings)

    // Set quota based on number of winners and if its proportional
    let quota = 0
    if (proportional) {
        quota = Math.floor(activeVotes.length/(nWinners + 1) + 1)
    } else {
        quota = Math.floor(activeVotes.length/2 + 1)
    }

    while (results.elected.length < nWinners) {

        if (DEBUG) console.log("IRV Round");

        let roundResults: irvRoundResults = {
            winners: [],
            runner_up: [],
            tied: [],
            tieBreakType: 'none',
            eliminated: [],
            logs: [],
            standings: []
        }

        let roundVoteCounts = summaryData.candidates.map((c, i) => ({ id: c.id, index: i, voteCount: addWeightedVotes(candidateVotes[c.id].votes) }))

        let sortedVoteCounts = [...roundVoteCounts].sort((a, b) => {
            if (a.voteCount !== b.voteCount) {
                return -(a.voteCount - b.voteCount)
            }

            // break tie in favor of candidate with higher score in previous rounds
            for (let i = results.voteCounts.length - 1; i >= 0; i--) {
                if (results.voteCounts[i][b.index] !== results.voteCounts[i][a.index]) {
                    return -(results.voteCounts[i][a.index] - results.voteCounts[i][b.index])
                }
            }

            return -(summaryData.candidates[a.index].tieBreakOrder - summaryData.candidates[b.index].tieBreakOrder)
        })

        if (DEBUG) console.log("roundVoteCounts", JSON.stringify(roundVoteCounts));
        results.voteCounts.push(roundVoteCounts.map(c => c.voteCount.valueOf()))

        // get max number of votes
        let remainingCandidatesIds = remainingCandidates.map(c => c.id)
        if (DEBUG) console.log(
          "remaining candidates indices",
          JSON.stringify(remainingCandidatesIds)
        );

        let maxVotes = sortedVoteCounts[0].voteCount
        let nActiveVotes = Object.values(candidateVotes).reduce((total, c) => total+c.votes.length, 0);
        if (!proportional) {
            quota = Math.floor(nActiveVotes /2 + 1)
        }

        results.exhaustedVoteCounts.push(tallyVotes.length - nActiveVotes)

        if (maxVotes >= quota) {
            // candidate meets the threshold
            // get index of winning candidate
            let winningCandidate = summaryData.candidates[sortedVoteCounts[0].index];
            // add winner, remove from remaining candidates
            results.elected.push(winningCandidate)
            roundResults.winners.push(winningCandidate)
            if (DEBUG) console.log("winner", winningCandidate);

            if (proportional) {
                remainingCandidates = remainingCandidates.filter(c => !results.elected.includes(c))
                let fractionalSurplus = new Fraction(maxVotes - quota).div(maxVotes)
                let winningCandidateVotes = candidateVotes[winningCandidate.id].votes;
                candidateVotes[winningCandidate.id].votes = []
                winningCandidateVotes.forEach(vote => {
                    vote.weight = vote.weight.mul(fractionalSurplus).floor(5)
                })
                distributeVotes(remainingCandidates, candidateVotes, winningCandidateVotes, results, electionSettings)
            }
            else {
                // Reset candidate pool and remove elected candidates
                remainingCandidates = [...summaryData.candidates].filter(c => !results.elected.includes(c))

                // Reset candidate vote counts and redistribute votes
                Object.entries(candidateVotes).forEach(([_, c]) => c.votes = [])
                distributeVotes(remainingCandidates, candidateVotes, weightedVotes, results, electionSettings)
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
            let remainingVoteCounts = sortedVoteCounts.filter(c => remainingCandidatesIds.includes(c.id))
            let lastPlaceCandidateId = remainingVoteCounts[remainingVoteCounts.length - 1].id;
            remainingCandidates = remainingCandidates.filter(c => c.id !== lastPlaceCandidateId)
            let eliminatedCandidateVotes = candidateVotes[lastPlaceCandidateId].votes;
            candidateVotes[lastPlaceCandidateId].votes = []
            distributeVotes(remainingCandidates, candidateVotes, eliminatedCandidateVotes, results, electionSettings)
            const toEliminate = candidateVotes[lastPlaceCandidateId].candidate;
            if (DEBUG) console.log("eliminate", JSON.stringify(toEliminate));
            roundResults.eliminated.push(toEliminate)
        }

        let remainingVoteCounts = sortedVoteCounts.filter(
            c => remainingCandidates.map(cc => cc.id).includes(c.id)
        );
        roundResults.standings = remainingVoteCounts.map(
            ({index, voteCount}) =>
            ({
              candidateIndex: index,
              hareScore: voteCount.valueOf()
            })
        );
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

function distributeVotes(remainingCandidates: irvCandidate[], candidateVotes: keyedObject<candidateVotes>, votesToDistribute: weightedVote[], results: irvResults, electionSettings?: ElectionSettings) {
    // we'll remove as votes get exhausted, hence the backwards iteration
    for(let i = votesToDistribute.length-1; i >= 0; i--){
        let ballot = votesToDistribute[i];
        let v = ballot.vote;

        const mapZero = (n: number) => n == 0 ? Infinity : n;
        let topCandidate = remainingCandidates.reduce((top, c) => mapZero(v.marks[top.id]) < mapZero(v.marks[c.id])? top : c)
        let topRemainingRank: number = (v.overvote_rank && v.marks[topCandidate.id] > v.overvote_rank) ? v.overvote_rank : v.marks[topCandidate.id];

        let prevTopRank = Object.entries(v.marks).reduce((prevTopRank, [_, rank]) => {
            if(rank == 0 || rank >= topRemainingRank) return prevTopRank;
            return Math.max(prevTopRank, rank);
        }, 0); // 0 as default to we can catch front skips

        // TODO: get "2" from election settings
        let exhaustedViaSkippedRankings = (topRemainingRank - prevTopRank) > (electionSettings?.exhaust_on_N_repeated_skipped_marks ?? 9999);
        let exhaustedViaOvervote = !exhaustedViaSkippedRankings && v.overvote_rank && topRemainingRank == v.overvote_rank;
        if (topRemainingRank === 0 || exhaustedViaOvervote || exhaustedViaSkippedRankings) {
            if(exhaustedViaSkippedRankings) results.nExhaustedViaSkippedRank++;
            if(exhaustedViaOvervote) results.nExhaustedViaOvervote++;

            // ballot is exhausted
            votesToDistribute.splice(i,1);
        } else {
            // give vote to top rank candidate
            candidateVotes[topCandidate.id].votes.push(ballot)
        }
    }
}
