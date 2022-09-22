import { approvalResults, approvalSummaryData, ballot, candidate, pluralityResults, pluralitySummaryData, totalScore } from "./ITabulators";

import { IparsedData } from './ParseData'
const ParseData = require("./ParseData");

export function Plurality(candidates: string[], votes: ballot[], nWinners = 1, breakTiesRandomly = true) {
  const parsedData = ParseData(votes, getPluralityBallotValidity)
  const summaryData = getSummaryData(candidates, parsedData)
  const results: pluralityResults = {
    elected: [],
    tied: [],
    other: [],
    roundResults: [],
    summaryData: summaryData,
  }
  const sortedScores = summaryData.totalScores.sort((a: totalScore, b: totalScore) => {
    if (a.score > b.score) return -1
    if (a.score < b.score) return 1
    return 0
  })
  
  var remainingCandidates = [...summaryData.candidates]
  while (remainingCandidates.length>0) {
    const topScore = sortedScores[results.elected.length]
    let scoreWinners = [summaryData.candidates[topScore.index]]
    for (let i = sortedScores.length-remainingCandidates.length+1; i < sortedScores.length; i++) {
      if (sortedScores[i].score === topScore.score) {
        scoreWinners.push(summaryData.candidates[sortedScores[i].index])
      }
    }
    if (breakTiesRandomly && scoreWinners.length>1) {
      scoreWinners = [scoreWinners[getRandomInt(scoreWinners.length)]]
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

function getSummaryData(candidates: string[], parsedData: IparsedData): pluralitySummaryData{
  // Initialize summary data structures
  const nCandidates = candidates.length
  const totalScores = Array(nCandidates)
  for (let i = 0; i < nCandidates; i++) {
    totalScores[i] = { index: i, score: 0 };
  }
  // Iterate through ballots, 
  parsedData.scores.forEach((vote) => {
    for (let i = 0; i < nCandidates; i++) {
      totalScores[i].score += vote[i]
    }
  })
  const candidatesWithIndexes = candidates.map((candidate, index) => ({ index: index, name: candidate }))
  return {
    candidates: candidatesWithIndexes,
    totalScores,
    nValidVotes: parsedData.validVotes.length,
    nInvalidVotes: parsedData.invalidVotes.length,
    nUnderVotes: parsedData.underVotes.length,
  }
}

function getPluralityBallotValidity(ballot: ballot) {
  const minScore = 0
  const maxScore = 1
  let isUnderVote = true
  let nSupported = 0
  for (let i = 0; i < ballot.length; i++) {
    if (ballot[i] < minScore || ballot[i] > maxScore) {
      return { isValid: false, isUnderVote: false }
    }
    if (ballot[i] > minScore) {
      isUnderVote = false
    }
    nSupported += ballot[i]
  }
  if (nSupported>1){
    return { isValid: false, isUnderVote: isUnderVote }
  }
  return { isValid: true, isUnderVote: isUnderVote }
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}