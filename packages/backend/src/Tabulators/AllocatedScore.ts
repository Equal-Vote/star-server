import { ballot, candidate, fiveStarCount, allocatedScoreResults, allocatedScoreSummaryData, totalScore } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

import { IparsedData } from './ParseData'
const Fraction = require('fraction.js');
import { sortByTieBreakOrder } from "./Star";
import { commaListFormatter } from "./Util";

const ParseData = require("./ParseData");
declare namespace Intl {
    class ListFormat {
        constructor(locales?: string | string[], options?: {});
        public format: (items: string[]) => string;
    }
}

const minScore = 0;
const maxScore = 5;

interface winner_scores {
    index: number
    ballot_weight: typeof Fraction,
    weighted_score: typeof Fraction
}

type ballotFrac = typeof Fraction[]

export function AllocatedScore(candidates: string[], votes: ballot[], nWinners = 3, randomTiebreakOrder: number[] = [], breakTiesRandomly = true, enablefiveStarTiebreaker = true) {
    // Determines STAR-PR winners for given election using Allocated Score
    // Parameters: 
    // candidates: Array of candidate names
    // votes: Array of votes, size nVoters x Candidates
    // nWiners: Number of winners in election, defaulted to 3
    // randomTiebreakOrder: Array to determine tiebreak order. If empty or not same length as candidates, set to candidate indexes
    // breakTiesRandomly: In the event of a true tie, should a winner be selected at random, defaulted to true
    // enablefiveStarTiebreaker: In the event of a true tie in the runoff round, should the five-star tiebreaker be used (select candidate with the most 5 star votes), defaulted to true
    // Parse the votes for valid, invalid, and undervotes, and identifies bullet votes
    const parsedData: IparsedData = ParseData(votes)

    // Compress valid votes into data needed to run election including
    // total scores
    // score histograms
    // preference and pairwise matrices
    const summaryData = getSummaryData(candidates, parsedData, randomTiebreakOrder)

    // Initialize output data structure
    const results: allocatedScoreResults = {
        votingMethod: 'STAR_PR',
        elected: [],
        tied: [],
        other: [],
        roundResults: [],
        summaryData: summaryData,
        tieBreakType: 'none',
        logs: []
    }
    var remainingCandidates = [...summaryData.candidates]
    // Run election rounds until there are no remaining candidates
    // Keep running elections rounds even if all seats have been filled to determine candidate order

    // Normalize scores array
    var scoresNorm = normalizeArray(parsedData.scores, maxScore);

    // Find number of voters and quota size
    const V = scoresNorm.length;
    const quota = new Fraction(V).div(nWinners);
    results.logs.push(`${nWinners} winners will represent ${V} voters, so winners will need to represent a quota of ${rounded(quota)} voters each.`)
    var num_candidates = candidates.length

    var ballot_weights: typeof Fraction[] = Array(V).fill(new Fraction(1));

    var ties = [];
    // var weightedSumsByRound = []
    var candidatesByRound: candidate[][] = []
    // run loop until specified number of winners are found
    while (results.elected.length < nWinners) {
        results.logs.push(`Round ${results.elected.length+1} of tabulation...`)
        // weight the scores
        var weighted_scores: ballotFrac[] = Array(scoresNorm.length);
        var weighted_sums: typeof Fraction[] = Array(num_candidates).fill(new Fraction(0));
        scoresNorm.forEach((ballot, b) => {
            weighted_scores[b] = [];
            ballot.forEach((score, s) => {
                weighted_scores[b][s] = score.mul(ballot_weights[b]);
                weighted_sums[s] = weighted_sums[s].add(weighted_scores[b][s])
            });
            // sum scores for each candidate
            // weighted_sums[r] = sumArray(weighted_scores[r]);
        });
        summaryData.weightedScoresByRound.push(weighted_sums.map(w => {
            return w.valueOf()
        }))

        candidatesByRound.push([...remainingCandidates])
        // get index of winner
        var maxAndTies = indexOfMax(weighted_sums, summaryData.candidates, breakTiesRandomly);
        var w = maxAndTies.maxIndex;
        // add winner to winner list
        results.logs.push(`${summaryData.candidates[w].name} is scored highest with ${rounded(weighted_sums[w].mul(maxScore))} stars and is elected!`)
        results.elected.push(summaryData.candidates[w]);
        // Update scores
        // the and is not perfect, but I'll fix this once I switch to localizing
        if(maxAndTies.ties.length > 1){
            results.logs.push(`${maxAndTies.ties.map(c => c.name).join(' and ')} are tied for the highest scores!`)
        }
        results.tied.push(maxAndTies.ties);
        // Set all scores for winner to zero
        scoresNorm.forEach((ballot, b) => {
            ballot[w] = new Fraction(0)
        })
        remainingCandidates = remainingCandidates.filter(c => c != summaryData.candidates[w])
        // remainingCandidates.splice(w, 1);

        // create arrays for sorting ballots
        var cand_df: winner_scores[] = [];
        var cand_df_sorted: winner_scores[] = [];

        weighted_scores.forEach((weighted_score, i) => {
            cand_df.push({
                index: i,
                ballot_weight: ballot_weights[i],
                weighted_score: weighted_score[w]
            });
            cand_df_sorted.push({
                index: i,
                ballot_weight: ballot_weights[i],
                weighted_score: weighted_score[w]
            });
        });

        cand_df_sorted.sort((a, b) =>
            a.weighted_score < b.weighted_score ? 1 : -1
        );

        var split_point = findSplitPoint(cand_df_sorted, quota);

        summaryData.splitPoints.push(split_point.valueOf());

        var spent_above = new Fraction(0);
        cand_df.forEach((c, i) => {
            if (c.weighted_score.compare(split_point) > 0) {
                spent_above = spent_above.add(c.ballot_weight);
            }
        });
        summaryData.spentAboves.push(spent_above.valueOf());

        if (spent_above.valueOf() > 0) {
            results.logs.push(`The ${rounded(spent_above)} voters who gave ${summaryData.candidates[w].name} more than ${rounded(split_point.mul(maxScore))} stars are fully represented and will be weighted to 0 for future rounds.`)
            cand_df.forEach((c, i) => {
                if (c.weighted_score.compare(split_point) > 0) {
                    cand_df[i].ballot_weight = new Fraction(0);
                }
            });
        }

        var weight_on_split = findWeightOnSplit(cand_df, split_point);

        // quota = spent_above + weight_on_split*new_weight
        let new_weight = (quota.sub(spent_above)).div(weight_on_split);
        results.logs.push(`(${rounded(quota)} - ${rounded(spent_above)}) / ${rounded(weight_on_split)} = ${rounded(new_weight)}`)
        results.logs.push(
            `The ${rounded(weight_on_split)} voters who gave ${summaryData.candidates[w].name} ${rounded(split_point.mul(maxScore))} stars are partially represented. `+
            `${percent(new_weight)} of their vote will go toward ${summaryData.candidates[w].name} and ${percent(new Fraction(1).sub(new_weight))} will be preserved for future rounds.`)

        summaryData.weight_on_splits.push(weight_on_split.valueOf());
        ballot_weights = updateBallotWeights(
            cand_df,
            ballot_weights,
            weight_on_split,
            quota,
            spent_above,
            split_point
        );
    }

    for (let i = 0; i < summaryData.weightedScoresByRound.length; i++) {
        for (let j = 0; j < summaryData.weightedScoresByRound[i].length; j++) {
            summaryData.weightedScoresByRound[i][j] *= maxScore
        }
    }

    results.other = remainingCandidates;

    return results
}

function rounded(n: typeof Fraction){
    return Math.round(n.valueOf()*100)/100
}

function percent(n: typeof Fraction){
    return `${Math.round(n.valueOf()*100)}%`
}

function getSummaryData(candidates: string[], parsedData: IparsedData, randomTiebreakOrder: number[]): allocatedScoreSummaryData {
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

    // Score histograms for data analysis and five-star tiebreakers
    const scoreHist: number[][] = Array(nCandidates);
    for (let i = 0; i < nCandidates; i++) {
        scoreHist[i] = Array(6).fill(0);
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
            totalScores[i].score += vote[i]
            scoreHist[i][vote[i]] += 1
            for (let j = 0; j < nCandidates; j++) {
                if (i !== j) {
                    if (vote[i] > vote[j]) {
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
            }
            else if (preferenceMatrix[i][j] < preferenceMatrix[j][i]) {
                pairwiseMatrix[j][i] = 1
            }

        }
    }
    const candidatesWithIndexes: candidate[] = candidates.map((candidate, index) => ({ index: index, name: candidate, tieBreakOrder: randomTiebreakOrder[index] }))
    return {
        candidates: candidatesWithIndexes,
        totalScores,
        scoreHist,
        preferenceMatrix,
        pairwiseMatrix,
        nValidVotes: parsedData.validVotes.length,
        nInvalidVotes: parsedData.invalidVotes.length,
        nUnderVotes: parsedData.underVotes,
        nBulletVotes: nBulletVotes,
        splitPoints: [],
        spentAboves: [],
        weight_on_splits: [],
        weightedScoresByRound: [],
        noPreferenceStars: [],
    }
}

function sortData(summaryData: allocatedScoreSummaryData, order: candidate[]): allocatedScoreSummaryData {
    // sorts summary data to be in specified order
    const indexOrder = order.map(c => c.index)
    const candidates = indexOrder.map(ind => (summaryData.candidates[ind]))
    candidates.forEach((c, i) => {
        c.index = i
    })
    const totalScores = indexOrder.map((ind, i) => ({ index: i, score: summaryData.totalScores[ind].score }))
    const scoreHist = indexOrder.map((ind) => summaryData.scoreHist[ind])
    const preferenceMatrix = sortMatrix(summaryData.preferenceMatrix, indexOrder)
    const pairwiseMatrix = sortMatrix(summaryData.pairwiseMatrix, indexOrder)
    return {
        candidates,
        totalScores,
        scoreHist,
        preferenceMatrix,
        pairwiseMatrix,
        nValidVotes: summaryData.nValidVotes,
        nInvalidVotes: summaryData.nInvalidVotes,
        nUnderVotes: summaryData.nUnderVotes,
        nBulletVotes: summaryData.nBulletVotes,
        splitPoints: summaryData.splitPoints,
        spentAboves: summaryData.spentAboves,
        weight_on_splits: summaryData.weight_on_splits,
        weightedScoresByRound: summaryData.weightedScoresByRound,
        noPreferenceStars: [],
    }
}

function updateBallotWeights(
    cand_df: winner_scores[],
    ballot_weights: typeof Fraction[],
    weight_on_split: typeof Fraction,
    quota: typeof Fraction,
    spent_above: typeof Fraction,
    split_point: typeof Fraction
) {
    if (weight_on_split.compare(0) > 0) {
        var spent_value = quota.sub(spent_above).div(weight_on_split);
        cand_df.forEach((c, i) => {
            if (c.weighted_score.equals(split_point)) {
                cand_df[i].ballot_weight = cand_df[i].ballot_weight.mul( (new Fraction(1).sub(spent_value) ) );
            }
        });
    }
    cand_df.forEach((c, i) => {
        if (c.ballot_weight.compare(1) > 0) {
            ballot_weights[i] = new Fraction(1);
        } else if (c.ballot_weight.compare(0) < 0) {
            ballot_weights[i] = new Fraction(0);
        } else {
            ballot_weights[i] = c.ballot_weight;
        }
    });

    return ballot_weights;
}

function findWeightOnSplit(cand_df: winner_scores[], split_point: typeof Fraction) {
    var weight_on_split = new Fraction(0);
    cand_df.forEach((c, i) => {
        if (c.weighted_score.equals(split_point)) {
            weight_on_split = weight_on_split.add(c.ballot_weight);
        }
    });
    return weight_on_split;
}

function indexOfMax(arr: typeof Fraction[], candidates: candidate[], breakTiesRandomly: boolean) {
    if (arr.length === 0) {
        return { maxIndex: -1, ties: [] };
    }

    var max = arr[0];
    var maxIndex = 0;
    var ties: candidate[] = [candidates[0]];
    for (var i = 1; i < arr.length; i++) {
        if (max.equals(arr[i])) {
            ties.push(candidates[i]);
        } else if (arr[i].compare(max) > 0) {
            maxIndex = i;
            max = arr[i];
            ties = [candidates[i]];
        }
    }
    if (breakTiesRandomly && ties.length > 1) {
        maxIndex = candidates.indexOf(sortByTieBreakOrder(ties)[0])
    }
    return { maxIndex, ties };
}

function normalizeArray(scores: ballot[], maxScore: number) {
    // Normalize scores array
    var scoresNorm: ballotFrac[] = Array(scores.length);
    scores.forEach((row, r) => {
        scoresNorm[r] = [];
        row.forEach((score, s) => {
            scoresNorm[r][s] = new Fraction(score).div(maxScore);
        });
    });
    return scoresNorm;
}

function findSplitPoint(cand_df_sorted: winner_scores[], quota: typeof Fraction) {
    var under_quota : any[] = [];
    var under_quota_scores: typeof Fraction[] = [];
    var cumsum = new Fraction(0);
    cand_df_sorted.forEach((c, i) => {
        cumsum = cumsum.add(c.ballot_weight);
        if (cumsum < quota || i == 0) {
            under_quota.push(c);
            under_quota_scores.push(c.weighted_score);
        }
    });
    return findMinFrac(under_quota_scores);
}

function sortMatrix(matrix: number[][], order: number[]) {
    var newMatrix: number[][] = Array(order.length);
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

function findMinFrac(fracs: typeof Fraction[]) {
    let minFrac = fracs[0]
    fracs.forEach(frac => {
        if (frac.compare(minFrac) < 0) {
            minFrac = frac
        }
    })
    return minFrac
}
