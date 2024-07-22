import { approvalResults, approvalSummaryData, ballot, candidate, roundResults, totalScore } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

import { IparsedData } from './ParseData'
import { getSummaryData, runBlockTabulator, totalScoreComparator } from "./Util";
const ParseData = require("./ParseData");

declare namespace Intl {
    class ListFormat {
        constructor(locales?: string | string[], options?: {});
        public format: (items: string[]) => string;
    }
}
const commaListFormatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

export function Approval(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder:number[] = [], breakTiesRandomly = true) {
  breakTiesRandomly = true // hard coding this for now

  const parsedData = ParseData(votes, getApprovalBallotValidity)

  const summaryData:approvalSummaryData = getSummaryData(
    candidates,
    parsedData,
    randomTiebreakOrder,
    'cardinal',
    (a, b) => totalScoreComparator('score', a, b)
  )

  const results: approvalResults = {
    elected: [],
    tied: [],
    other: [],
    roundResults: [],
    summaryData: summaryData,
    tieBreakType: 'none',
  };

  return runBlockTabulator(results, summaryData, nWinners, singleWinnerApproval)
}

const singleWinnerApproval = (scoresLeft: totalScore[], summaryData: approvalSummaryData): roundResults => {
  const candidates = summaryData.candidates;

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
    ],
    tieBreakType: (tiedCandidates.length == 1)? 'none' : 'random',
    tiedCandidates,
  };
  
  return roundResults;
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