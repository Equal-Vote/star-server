import { ballot, candidate, rankedRobinResults, rankedRobinSummaryData, roundResults, totalScore } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

import { IparsedData } from './ParseData'
import { sortByTieBreakOrder } from "./Star";
const ParseData = require("./ParseData");

export function RankedRobin(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder:number[] = [], breakTiesRandomly = true) {
  // Determines Ranked Robin winners for given election
  // Parameters: 
  // candidates: Array of candidate names
  // votes: Array of votes, size nVoters x Candidates
  // nWiners: Number of winners in election, defaulted to 1
  // randomTiebreakOrder: Array to determine tiebreak order. If empty or not same length as candidates, set to candidate indexes
  // breakTiesRandomly: In the event of a true tie, should a winner be selected at random, defaulted to true

  // Parse the votes for valid, invalid, and undervotes, and identifies bullet votes
  const parsedData = ParseData(votes,getRankedRobinBallotValidity)

  // Compress valid votes into data needed to run election including
  // total scores
  // score histograms
  // preference and pairwise matrices
  const summaryData = getSummaryData(candidates, parsedData, randomTiebreakOrder)

  // Initialize output data structure
  const results: rankedRobinResults = {
    votingMethod: 'RankedRobin',
    elected: [],
    tied: [],
    other: [],
    roundResults: [],
    summaryData: summaryData,
    tieBreakType: 'none',
  }
  var remainingCandidates = [...summaryData.candidates]
  // Run election rounds until there are no remaining candidates
  // Keep running elections rounds even if all seats have been filled to determine candidate order
  while (remainingCandidates.length>0){
    const roundResults = runRankedRobinRound(summaryData, remainingCandidates, breakTiesRandomly)
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

function getRankedRobinBallotValidity(ballot: ballot) {
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

function getSummaryData(candidates: string[], parsedData: IparsedData, randomTiebreakOrder:number[]): rankedRobinSummaryData {
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
      if (iRank === 0 || iRank === null) {
        iRank = nCandidates
      }
      rankHist[i][iRank-1] += 1
      for (let j = 0; j < nCandidates; j++) {
        
        let jRank = vote[j]
        if (jRank === 0 || jRank === null) {
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
        totalScores[i].score +=1
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

function sortData(summaryData: rankedRobinSummaryData, order: candidate[]): rankedRobinSummaryData {
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

function runRankedRobinRound(summaryData: rankedRobinSummaryData, remainingCandidates: candidate[], breakTiesRandomly = true) {
  // Initialize output results data structure
  const roundResults: roundResults = {
    winners: [],
    runner_up: [],
    tied: [],
    tieBreakType: 'none',
    logs: [],
  }

  // If only one candidate remains, mark as winner
  if (remainingCandidates.length === 1) {
    roundResults.winners.push(...remainingCandidates)
    return roundResults
  }

  let winners = getWinners(summaryData,remainingCandidates)

  if (winners.length===1) {
    roundResults.winners.push(winners[0])
    roundResults.logs.push(`${winners[0].name} wins round with highest number of wins.`)
    return roundResults
  }
  else if (winners.length===2){
    if (summaryData.pairwiseMatrix[winners[0].index][winners[1].index]===1) {
      roundResults.winners.push(winners[0])
      roundResults.logs.push(`${winners[0].name} preferred over ${winners[1].name} in runoff.`)
      return roundResults
    }
    if (summaryData.pairwiseMatrix[winners[1].index][winners[0].index]===1) {
      roundResults.winners.push(winners[1])
      roundResults.logs.push(`${winners[1].name} preferred over ${winners[0].name} in runoff.`)
      return roundResults
    }
  }
  if (breakTiesRandomly) {
    const randomWinner = sortByTieBreakOrder(winners)[0]
    roundResults.winners.push(randomWinner)
    roundResults.logs.push(`${winners[0].name} picked in random tie-breaker, more robust tiebreaker not yet implemented.`)
    return roundResults
  }
  roundResults.winners.push(...winners)
  roundResults.logs.push(`${winners.map(c => c.name).join(', ')} tied.`)
  return roundResults
}

function getWinners(summaryData: rankedRobinSummaryData, eligibleCandidates: candidate[]) {
  // Searches for candidate(s) with highest score

  // Sort candidate total wins 
  const eligibleCandidateWins: totalScore[] = []
  eligibleCandidates.forEach((c) => eligibleCandidateWins.push(summaryData.totalScores[c.index]))
  const sortedWins = eligibleCandidateWins.sort((a: totalScore, b: totalScore) => {
    if (a.score > b.score) return -1
    if (a.score < b.score) return 1
    return 0
  })

  // Return all candidates that tie for top score
  const topScore = sortedWins[0]
  const winners = [summaryData.candidates[topScore.index]]
  for (let i = 1; i < sortedWins.length; i++) {
    if (sortedWins[i].score === topScore.score) {
      winners.push(summaryData.candidates[sortedWins[i].index])
    }
  }
  return winners
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