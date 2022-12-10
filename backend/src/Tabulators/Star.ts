import { ballot, candidate, results, roundResults, summaryData, totalScore } from "./ITabulators";

import { IparsedData } from './ParseData'
const ParseData = require("./ParseData");

export function Star(candidates: string[], votes: ballot[], nWinners = 1, breakTiesRandomly = true, enablefiveStarTiebreaker = true) {
  // Determines STAR winners for given election
  // Parameters: 
  // candidates: Array of candidate names
  // votes: Array of votes, size nVoters x Candidates
  // nWiners: Number of winners in election, defaulted to 1
  // breakTiesRandomly: In the event of a true tie, should a winner be selected at random, defaulted to true
  // enablefiveStarTiebreaker: In the event of a true tie, should the five-star tiebreaker be used (select candidate with the most 5 star votes), defaulted to true

  // Parse the votes for valid, invalid, and undervotes, and identifies bullet votes
  const parsedData = ParseData(votes)

  // Compress valid votes into data needed to run election including
  // total scores
  // score histograms
  // preference and pairwise matrices
  const summaryData = getSummaryData(candidates, parsedData)

  // Initialize output data structure
  const results: results = {
    elected: [],
    tied: [],
    other: [],
    roundResults: [],
    summaryData: summaryData,
  }
  var remainingCandidates = [...summaryData.candidates]
  // Run election rounds until there are no remaining candidates
  // Keep running elections rounds even if all seats have been filled to determine candidate order
  while (remainingCandidates.length>0){
    const roundResults = runStarRound(summaryData, remainingCandidates, breakTiesRandomly, enablefiveStarTiebreaker)
    if ((results.elected.length + results.tied.length + roundResults.winners.length) <= nWinners) {
      // There are enough seats available to elect all winners of current round
      results.elected.push(...roundResults.winners)
      results.roundResults.push(roundResults)
    }
    else if (results.tied.length===0 && results.elected.length<nWinners){
      // If there are vacant seats but too many winners to fill them, mark those candidates as tied
      results.tied.push(...roundResults.winners)
      results.roundResults.push(roundResults)
    }
    else {
      // All seats have been filled or ties identified, remaining candiates added to other group
      results.other.push(...roundResults.winners)

    }
    remainingCandidates = remainingCandidates.filter(c => !roundResults.winners.includes(c))
  }

  // Sort data in order of candidate placements
  results.summaryData = sortData(summaryData, results.elected.concat(results.tied).concat(results.other))
  return results
}

function getSummaryData(candidates: string[], parsedData: IparsedData): summaryData {
  const nCandidates = candidates.length
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
        if (!(i == j)) {
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
  const candidatesWithIndexes: candidate[] = candidates.map((candidate, index) => ({ index: index, name: candidate }))
  return {
    candidates: candidatesWithIndexes,
    totalScores,
    scoreHist,
    preferenceMatrix,
    pairwiseMatrix,
    nValidVotes: parsedData.validVotes.length,
    nInvalidVotes: parsedData.invalidVotes.length,
    nUnderVotes: parsedData.underVotes.length,
    nBulletVotes: nBulletVotes
  }
}

function sortData(summaryData: summaryData, order: candidate[]): summaryData {
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
  }
}

function runStarRound(summaryData: summaryData, remainingCandidates: candidate[], breakTiesRandomly = true, enablefiveStarTiebreaker = true) {
  // Initialize output results data structure
  const roundResults: roundResults = {
    winners: [],
    runner_up: [],
    logs: [],
  }

  // If only one candidate remains, mark as winner
  if (remainingCandidates.length === 1) {
    roundResults.winners.push(...remainingCandidates)
    return roundResults
  }

  // Score round
  // Iterate through remaining candidates looking for two top scoring candidates to advance to runoff round
  // In most elections this is a simple process, but for cases where there are ties we advance one candidate at a time
  // and resolve ties as they occur
  const runoffCandidates: candidate[] = []
  while (runoffCandidates.length < 2) {
    const eligibleCandidates = remainingCandidates.filter(c => !runoffCandidates.includes(c))
    const scoreWinners = getScoreWinners(summaryData, eligibleCandidates)
    if (scoreWinners.length === 1) {
      // Candidate has top score, advances to runoff
      runoffCandidates.push(summaryData.candidates[scoreWinners[0].index])
      roundResults.logs.push(`${scoreWinners[0].name} advances to the runoff round with a score of ${summaryData.totalScores[scoreWinners[0].index].score}.`)
      continue
    }
    // Multiple candidates have top score, proceed to score tiebreaker
    roundResults.logs.push(`${scoreWinners.map(c => c.name).join(', ')} advances to score tiebreaker.`)
    let scoreTieWinners = runScoreTiebreaker(summaryData, scoreWinners)
    if (scoreTieWinners.length === 1) {
      // Candidate wins score tiebreaker
      runoffCandidates.push(scoreTieWinners[0])
      roundResults.logs.push(`${scoreTieWinners[0].name} wins score tiebreaker and advances to the runoff round.`)
      continue
    }
    if (scoreTieWinners.length === 2 && runoffCandidates.length === 0) {
      // Tie between two candidates, but both can advance to runoff
      runoffCandidates.push(...scoreTieWinners)
      roundResults.logs.push(`${scoreTieWinners[0].name} and ${scoreTieWinners[1].name} win score tiebreaker and advances to the runoff round.`)
      continue
    }
    // True Tie, other tiebreaker is neededed
    roundResults.logs.push(`True tie between ${scoreTieWinners.map(c => c.name).join(', ')}.`)
    if (enablefiveStarTiebreaker) {
      // Five-star tiebreaker is enabled, look for candidate with most 5 star votes
      const fiveStarWinners = fiveStarTiebreaker(summaryData, scoreTieWinners)
      if (fiveStarWinners.length === 1) {
        // Candidate wins five-star tiebreaker
        runoffCandidates.push(...fiveStarWinners)
        roundResults.logs.push(`${scoreTieWinners[0].name} wins five-star tiebreaker and advances to the runoff round.`)
        continue
      }
      if (fiveStarWinners.length === 2 && runoffCandidates.length === 0) {
        // Two candidates win five-star tiebreaker, both advance to runoff
        runoffCandidates.push(...fiveStarWinners)
        roundResults.logs.push(`${fiveStarWinners[0].name} and ${fiveStarWinners[1].name} win five-star tiebreaker and advances to the runoff round.`)
        continue
      }
      // Could not resolve tie with five-star tiebreaker
      roundResults.logs.push(`Could not resolve tie with five-star tiebreaker.`)
      scoreTieWinners = fiveStarWinners
    }
    if (breakTiesRandomly) {
      // Random tiebreaker enabled, selects a candidate at random
      const randomWinner = scoreTieWinners[getRandomInt(scoreTieWinners.length)]
      roundResults.logs.push(`${randomWinner.name} wins random tiebreaker and advances to the runoff round.`)
      runoffCandidates.push(randomWinner)
      continue
    }
    // Tie could not be resolved, select all tied candidates as winners of round
    roundResults.winners.push(...runoffCandidates)
    roundResults.winners.push(...scoreTieWinners)
    return roundResults
  }

  if (summaryData.pairwiseMatrix[runoffCandidates[0].index][runoffCandidates[1].index] === 1) {
    // First candidate wins runoff
    roundResults.winners.push(runoffCandidates[0])
    roundResults.runner_up.push(runoffCandidates[1])
    roundResults.logs.push(`${runoffCandidates[0].name} defeats ${runoffCandidates[1].name} with ${summaryData.preferenceMatrix[runoffCandidates[0].index][runoffCandidates[1].index]} votes to ${summaryData.preferenceMatrix[runoffCandidates[1].index][runoffCandidates[0].index]}.`)
    return roundResults
  }
  if (summaryData.pairwiseMatrix[runoffCandidates[1].index][runoffCandidates[0].index] === 1) {
    // Second candidate wins runoff
    roundResults.winners.push(runoffCandidates[1])
    roundResults.runner_up.push(runoffCandidates[0])
    roundResults.logs.push(`${runoffCandidates[1].name} defeats ${runoffCandidates[0].name} with ${summaryData.preferenceMatrix[runoffCandidates[1].index][runoffCandidates[0].index]} votes to ${summaryData.preferenceMatrix[runoffCandidates[0].index][runoffCandidates[1].index]}.`)
    return roundResults
  }
  // Tie, run runoff tiebreaker
  const runoffTieWinner = runRunoffTiebreaker(summaryData, runoffCandidates)
  if (runoffTieWinner === 0) {
    roundResults.winners = [runoffCandidates[0]]
    roundResults.runner_up = [runoffCandidates[1]]
    roundResults.logs.push(`${runoffCandidates[0].name} defeats ${runoffCandidates[1].name} in runoff tiebreaker with a score of ${summaryData.totalScores[runoffCandidates[0].index]} to ${summaryData.totalScores[runoffCandidates[1].index]}.`)
    return roundResults
  }
  if (runoffTieWinner === 1) {
    roundResults.winners = [runoffCandidates[1]]
    roundResults.runner_up = [runoffCandidates[0]]
    roundResults.logs.push(`${runoffCandidates[1].name} defeats ${runoffCandidates[0].name} in runoff tiebreaker with a score of ${summaryData.totalScores[runoffCandidates[1].index]} to ${summaryData.totalScores[runoffCandidates[0].index]}.`)
    return roundResults
  }
  // True tie, other tiebreaker needed to resolve
  roundResults.logs.push(`True tie between ${runoffCandidates[0].name} and ${runoffCandidates[1].name}.`)
  if (enablefiveStarTiebreaker) {
    // Five-star tiebreaker is enabled, look for candidate with most 5 star votes
    const fiveStarWinners = fiveStarTiebreaker(summaryData, runoffCandidates)
    if (fiveStarWinners.length === 1) {
      roundResults.winners = [fiveStarWinners[0]]
      roundResults.runner_up = runoffCandidates.filter(c => c.index != fiveStarWinners[0].index)
      roundResults.logs.push(`${roundResults.winners[0].name} defeats ${roundResults.runner_up[0].name} in five-star tiebreaker.`)
      return roundResults
    }
    // Could not resolve tie with five-star tiebreaker
    roundResults.logs.push(`Could not resolve tie with five-star tiebreaker.`)
  }
  if (breakTiesRandomly) {
    // Break tie randomly
    const randomWinner = getRandomInt(2)
    roundResults.winners = [runoffCandidates[randomWinner]]
    roundResults.runner_up = [runoffCandidates[1 - randomWinner]]
    roundResults.logs.push(`${runoffCandidates[randomWinner].name} defeats ${runoffCandidates[1 - randomWinner].name} in random tiebreaker.`)
    return roundResults
  }
  // Tie could not be resolved, select both tied candidates as winners of round
  roundResults.winners = runoffCandidates
  return roundResults
}

function getScoreWinners(summaryData: summaryData, eligibleCandidates: candidate[]) {
  // Searches for candidate(s) with highest score

  // Sort candidate total scores 
  const eligibleCandidateScores: totalScore[] = []
  eligibleCandidates.forEach((c) => eligibleCandidateScores.push(summaryData.totalScores[c.index]))
  const sortedScores = eligibleCandidateScores.sort((a: totalScore, b: totalScore) => {
    if (a.score > b.score) return -1
    if (a.score < b.score) return 1
    return 0
  })

  // Return all candidates that tie for top score
  const topScore = sortedScores[0]
  const scoreWinners = [summaryData.candidates[topScore.index]]
  for (let i = 1; i < sortedScores.length; i++) {
    if (sortedScores[i].score === topScore.score) {
      scoreWinners.push(summaryData.candidates[sortedScores[i].index])
    }
  }
  return scoreWinners
}

function runScoreTiebreaker(summaryData: summaryData, scoreWinners: candidate[]) {
  // Search for weak condorcet winner between tied candidates
  // Iterates through each candidate, if candidate does not lose to any other tied candidate, mark as winner
  const condorcetWinners: candidate[] = [];
  scoreWinners.forEach(a => {
    let isWinner = true
    scoreWinners.forEach(b => {
      if (summaryData.pairwiseMatrix[b.index][a.index] === 1) {
        isWinner = false
      }
    })
    if (isWinner) condorcetWinners.push(a)
  })
  if (condorcetWinners.length === 1) return condorcetWinners
  else if (condorcetWinners.length === 0) return scoreWinners
  else return condorcetWinners
}

function runRunoffTiebreaker(summaryData: summaryData, runoffCandidates: candidate[]) {
  // Search for candidate with highest score between two runoff candidates
  if (summaryData.totalScores[runoffCandidates[0].index].score > summaryData.totalScores[runoffCandidates[1].index].score) {
    return 0
  }
  if (summaryData.totalScores[runoffCandidates[0].index].score < summaryData.totalScores[runoffCandidates[1].index].score) {
    return 1
  }
  return null
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
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

function fiveStarTiebreaker(summaryData: summaryData, candidates: candidate[]) {
  // Search for candidates with most five-star votes
  let maxFiveStarVotes = 0
  let fiveStarWinners: candidate[] = []
  candidates.forEach((candidate) => {
    const fiveStarVotes = summaryData.scoreHist[candidate.index][5]
    if (fiveStarVotes > maxFiveStarVotes) {
      maxFiveStarVotes = fiveStarVotes
      fiveStarWinners = [candidate]
    }
    else if (fiveStarVotes === maxFiveStarVotes) {
      fiveStarWinners.push(candidate)
    }
  })
  return fiveStarWinners
}