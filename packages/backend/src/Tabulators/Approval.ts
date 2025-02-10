import { approvalResults, approvalSummaryData, ballot, candidate, roundResults, totalScore } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

import { commaListFormatter, getInitialData, makeBoundsTest, makeAbstentionTest, runBlocTabulator } from "./Util";
import { ElectionSettings } from "@equal-vote/star-vote-shared/domain_model/ElectionSettings";

export function Approval(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder:number[] = [], breakTiesRandomly = true, electionSettings?:ElectionSettings) {
  const [_, summaryData] = getInitialData<approvalSummaryData>(
		votes, candidates, randomTiebreakOrder, 'cardinal',
		[
			makeBoundsTest(0, 1),
			makeAbstentionTest(0),
		]
	)

	return runBlocTabulator<approvalResults, approvalSummaryData>(
		{
			votingMethod: 'Approval',
			elected: [],
			tied: [],
			other: [],
			roundResults: [],
			summaryData: summaryData,
			tieBreakType: 'none',
		} as approvalResults,
		nWinners,
		singleWinnerApproval
	)
}

const singleWinnerApproval = (remainingCandidates: candidate[], summaryData: approvalSummaryData): roundResults => {
  const candidates = summaryData.candidates;

  let scoresLeft = remainingCandidates.map(c => summaryData.totalScores.find(s => s.index == c.index)) as totalScore[];
  scoresLeft.sort((a:totalScore, b:totalScore) => -(a.score-b.score));

  let topScore = scoresLeft[0];
  let tiedCandidates = scoresLeft
    .filter(s => s.score == topScore.score)
    .map(s => candidates[s.index]);
  let winner = candidates[topScore.index];

  return {
    winners: [winner],
    runner_up: [],
    logs: (tiedCandidates.length == 1)? [
      `${winner.name} has the most approvals and wins the round`
    ] : [
      `${commaListFormatter.format(tiedCandidates.map(c => c.name))} all tied with the most approvals`,
      `${winner.name} wins the round after a random tiebreaker`
    ],
    tieBreakType: (tiedCandidates.length == 1)? 'none' : 'random',
    tied: tiedCandidates,
  };
}