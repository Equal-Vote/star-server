import { approvalResults, approvalSummaryData, ballot, candidate, totalScore } from "./ITabulators";

import { IparsedData } from './ParseData'
const ParseData = require("./ParseData");

export function Approval(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder:string[] = [], breakTiesRandomly = true) {
  const parsedData = ParseData(votes, getApprovalBallotValidity)
  const summaryData = getSummaryData(candidates, parsedData, randomTiebreakOrder)
  const results: approvalResults = {
    elected: [],
    tied: [],
    other: [],
    roundResults: [],
    summaryData: summaryData,
  }
  const sortedScores = summaryData.totalScores.sort((a: totalScore, b: totalScore) => {
    if (a.score > b.score) return -1
    if (a.score < b.score) return 1
    if (summaryData.candidates[a.index].tieBreakOrder < summaryData.candidates[b.index].tieBreakOrder) return -1
    return 1
  })
  
  var remainingCandidates = [...summaryData.candidates]
  while (remainingCandidates.length>0) {
    const topScore = sortedScores[results.elected.length + results.tied.length + results.other.length]
    let scoreWinners = [summaryData.candidates[topScore.index]]
    for (let i = sortedScores.length-remainingCandidates.length+1; i < sortedScores.length; i++) {
      if (sortedScores[i].score === topScore.score) {
        scoreWinners.push(summaryData.candidates[sortedScores[i].index])
      }
    }
    if (breakTiesRandomly && scoreWinners.length>1) {
      scoreWinners = [scoreWinners[0]]
    }
    if ((results.elected.length + results.tied.length + scoreWinners.length)<=nWinners) {
      results.elected.push(...scoreWinners)
    }
    else if (results.tied.length===0 && results.elected.length<nWinners){
      results.tied.push(...scoreWinners)
    }
    else {
      results.other.push(...scoreWinners)
    }
    remainingCandidates = remainingCandidates.filter(c => !scoreWinners.includes(c))
  }
  
  return results;
}

function getSummaryData(candidates: string[], parsedData: IparsedData, randomTiebreakOrder:string[]): approvalSummaryData {
  // Initialize summary data structures
  const nCandidates = candidates.length
  if (randomTiebreakOrder.length < nCandidates) {
    randomTiebreakOrder = candidates.map((c,index) => index.toString())
  }
  const totalScores = Array(nCandidates)
  for (let i = 0; i < nCandidates; i++) {
    totalScores[i] = { index: i, score: 0 };
  }
  let nBulletVotes = 0
  // Iterate through ballots, 
  parsedData.scores.forEach((vote) => {
    let nSupported = 0
    for (let i = 0; i < nCandidates; i++) {
      totalScores[i].score += vote[i]
      if (vote[i] > 0) {
        nSupported += 1
      }
    }
    if (nSupported === 1) {
      nBulletVotes += 1
    }
  })
  const candidatesWithIndexes: candidate[] = candidates.map((candidate, index) => ({ index: index, name: candidate, tieBreakOrder: randomTiebreakOrder[index] }))
  return {
    candidates: candidatesWithIndexes,
    totalScores,
    nValidVotes: parsedData.validVotes.length,
    nInvalidVotes: parsedData.invalidVotes.length,
    nUnderVotes: parsedData.underVotes,
    nBulletVotes: nBulletVotes
  }
}

function getApprovalBallotValidity(ballot: ballot) {
  const minScore = 0
  const maxScore = 1
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