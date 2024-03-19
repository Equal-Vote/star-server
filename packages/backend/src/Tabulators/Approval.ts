import { approvalResults, approvalSummaryData, ballot, candidate, roundResults, totalScore } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

import { IparsedData } from './ParseData'
import { commaListFormatter, sortTotalScores } from "./Util";
const ParseData = require("./ParseData");

export function Approval(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder:number[] = [], breakTiesRandomly = true) {
  breakTiesRandomly = true // hard coding this for now

  const parsedData = ParseData(votes, getApprovalBallotValidity)
  const summaryData = getSummaryData(candidates, parsedData, randomTiebreakOrder)
  const results: approvalResults = {
    elected: [],
    tied: [],
    other: [],
    roundResults: [],
    summaryData: summaryData,
    tieBreakType: 'none',
  };

  let scoresLeft = [...summaryData.totalScores];

  for(let w = 0; w < nWinners; w++){
    let {roundResults, tieBreakType, tiedCandidates} = SingleWinnerApproval(scoresLeft, summaryData.candidates);

    results.elected.push(...roundResults.winners);
    results.roundResults.push(roundResults);

    // remove winner for next round
    scoresLeft.shift();

    // only save the tie breaker info if we're in the final round
    if(w == nWinners-1){
      results.tied = tiedCandidates; 
      results.tieBreakType = tieBreakType; // only save the tie breaker info if we're in the final round
    }
  }

  results.other = scoresLeft.map(s => summaryData.candidates[s.index]); // remaining candidates in sortedScores
  
  return results;
}

const SingleWinnerApproval = (scoresLeft: totalScore[], candidates: candidate[]) => {
  let topScore = scoresLeft[0];
  let tiedCandidates = scoresLeft
    .filter(s => s.score == topScore.score)
    .map(s => candidates[s.index]);
  let winner = candidates[topScore.index];

  let roundResults: roundResults  = {
    winners: [winner],
    runner_up: [],
    logs: (tiedCandidates.length == 1)? [
      `${winner.name} has the most approvals and wins the round`
    ] : [
      `${commaListFormatter.format(tiedCandidates.map(c => c.name))} all tied with the most approvals`,
      `${winner.name} wins the round after a random tiebreaker`
    ]
  }
  
  return {
    roundResults,
    tieBreakType: (tiedCandidates.length == 1)? 'none' : 'random',
    tiedCandidates,
  };
}

function getSummaryData(candidates: string[], parsedData: IparsedData, randomTiebreakOrder:number[]): approvalSummaryData {
  // Initialize summary data structures
  const nCandidates = candidates.length
  if (randomTiebreakOrder.length < nCandidates) {
    randomTiebreakOrder = candidates.map((c,index) => index)
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
  sortTotalScores(totalScores, candidatesWithIndexes);
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