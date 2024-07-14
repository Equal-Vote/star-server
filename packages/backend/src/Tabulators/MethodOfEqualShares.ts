import {
  ballot,
  candidate,
  allocatedScoreResults,
  allocatedScoreSummaryData,
  totalScore,
} from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import { IparsedData } from "./ParseData";
const Fraction = require("fraction.js");
import { sortByTieBreakOrder } from "./Star";

const ParseData = require("./ParseData");

const minScore = 0;
const maxScore = 5;

interface InfluenceBudget {
  index: number;
  budget: typeof Fraction;
}

export function MethodOfEqualShares(
  candidates: string[],
  votes: ballot[],
  nWinners = 3,
  randomTiebreakOrder: number[] = [],
  breakTiesRandomly = true,
  enablefiveStarTiebreaker = true,
) {
  const parsedData: IparsedData = ParseData(votes);
  const summaryData = getSummaryData(
    candidates,
    parsedData,
    randomTiebreakOrder,
  );

  const results: allocatedScoreResults = {
    elected: [],
    tied: [],
    other: [],
    roundResults: [],
    summaryData: summaryData,
    tieBreakType: "none",
  };
  let remainingCandidates = [...summaryData.candidates];
  const scoresNorm = normalizeArray(parsedData.scores, maxScore);
  const V = scoresNorm.length;
  const quota = new Fraction(V).div(nWinners);
  let num_candidates = candidates.length;

  let influenceBudgets: (typeof Fraction)[] = Array(V).fill(new Fraction(1));

  while (results.elected.length < nWinners) {
    let weighted_scores: ballotFrac[] = Array(scoresNorm.length);
    let influenceCosts: (typeof Fraction)[] = Array(num_candidates).fill(
      new Fraction(0),
    );

    scoresNorm.forEach((ballot, b) => {
      weighted_scores[b] = [];
      ballot.forEach((score, s) => {
        weighted_scores[b][s] = score.mul(influenceBudgets[b]);
        influenceCosts[s] = influenceCosts[s].add(weighted_scores[b][s]);
      });
    });

    summaryData.weightedScoresByRound.push(
      influenceCosts.map((w) => w.valueOf()),
    );

    const maxAndTies = indexOfMax(
      influenceCosts,
      summaryData.candidates,
      breakTiesRandomly,
    );
    const w = maxAndTies.maxIndex;
    results.tied.push(maxAndTies.ties);
    results.elected.push(summaryData.candidates[w]);

    scoresNorm.forEach((ballot, b) => {
      ballot[w] = new Fraction(0);
    });

    remainingCandidates = remainingCandidates.filter(
      (c) => c != summaryData.candidates[w],
    );

    influenceBudgets = updateInfluenceBudgets(
      weighted_scores,
      influenceBudgets,
      quota,
      w,
    );
  }

  results.other = remainingCandidates;
  return results;
}

function updateInfluenceBudgets(
  weighted_scores: ballotFrac[],
  influenceBudgets: (typeof Fraction)[],
  quota: typeof Fraction,
  winnerIndex: number,
): (typeof Fraction)[] {
  // Calculate total influence spent on the winning candidate
  let totalSpent = new Fraction(0);
  weighted_scores.forEach((ballot, i) => {
    totalSpent = totalSpent.add(ballot[winnerIndex]);
  });

  // If the total spent influence is greater than the quota, redistribute
  if (totalSpent.compare(quota) > 0) {
    const excessInfluence = totalSpent.sub(quota);
    const spentFraction = quota.div(totalSpent);

    // Reduce the influence budget proportionally
    influenceBudgets = influenceBudgets.map((budget, i) => {
      if (weighted_scores[i][winnerIndex].compare(0) > 0) {
        const spent = weighted_scores[i][winnerIndex];
        const reducedSpent = spent.mul(spentFraction);
        const returnedInfluence = spent.sub(reducedSpent);
        return budget.add(returnedInfluence);
      } else {
        return budget;
      }
    });
  } else {
    // If not, fully deduct the influence spent on the winner
    influenceBudgets = influenceBudgets.map((budget, i) => {
      const spent = weighted_scores[i][winnerIndex];
      return budget.sub(spent);
    });
  }

  return influenceBudgets;
}

type ballotFrac = (typeof Fraction)[];

function getSummaryData(
  candidates: string[],
  parsedData: IparsedData,
  randomTiebreakOrder: number[],
): allocatedScoreSummaryData {
  const nCandidates = candidates.length;
  if (randomTiebreakOrder.length < nCandidates) {
    randomTiebreakOrder = candidates.map((c, index) => index);
  }
  // Initialize summary data structures
  // Total scores for each candidate, includes candidate indexes for easier sorting
  const totalScores: totalScore[] = Array(nCandidates);
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
  let nBulletVotes = 0;

  // Iterate through ballots and populate data structures
  parsedData.scores.forEach((vote) => {
    let nSupported = 0;
    for (let i = 0; i < nCandidates; i++) {
      totalScores[i].score += vote[i];
      scoreHist[i][vote[i]] += 1;
      for (let j = 0; j < nCandidates; j++) {
        if (i !== j) {
          if (vote[i] > vote[j]) {
            preferenceMatrix[i][j] += 1;
          }
        }
      }
      if (vote[i] > 0) {
        nSupported += 1;
      }
    }
    if (nSupported === 1) {
      nBulletVotes += 1;
    }
  });

  for (let i = 0; i < nCandidates; i++) {
    for (let j = 0; j < nCandidates; j++) {
      if (preferenceMatrix[i][j] > preferenceMatrix[j][i]) {
        pairwiseMatrix[i][j] = 1;
      } else if (preferenceMatrix[i][j] < preferenceMatrix[j][i]) {
        pairwiseMatrix[j][i] = 1;
      }
    }
  }
  const candidatesWithIndexes: candidate[] = candidates.map(
    (candidate, index) => ({
      index: index,
      name: candidate,
      tieBreakOrder: randomTiebreakOrder[index],
    }),
  );
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
  };
}

function sortData(
  summaryData: allocatedScoreSummaryData,
  order: candidate[],
): allocatedScoreSummaryData {
  // sorts summary data to be in specified order
  const indexOrder = order.map((c) => c.index);
  const candidates = indexOrder.map((ind) => summaryData.candidates[ind]);
  candidates.forEach((c, i) => {
    c.index = i;
  });
  const totalScores = indexOrder.map((ind, i) => ({
    index: i,
    score: summaryData.totalScores[ind].score,
  }));
  const scoreHist = indexOrder.map((ind) => summaryData.scoreHist[ind]);
  const preferenceMatrix = sortMatrix(summaryData.preferenceMatrix, indexOrder);
  const pairwiseMatrix = sortMatrix(summaryData.pairwiseMatrix, indexOrder);
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
  };
}

function indexOfMax(
  arr: (typeof Fraction)[],
  candidates: candidate[],
  breakTiesRandomly: boolean,
) {
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
    maxIndex = candidates.indexOf(sortByTieBreakOrder(ties)[0]);
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
  return newMatrix;
}
