import { approvalSummaryData, ballot, pluralityResults, pluralitySummaryData, roundResults, totalScore } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

import { commaListFormatter, getInitialData, makeBoundsTest, makeAbstentionTest, runBlocTabulator } from "./Util";

export function Plurality(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder:number[] = [], breakTiesRandomly = true) {
  breakTiesRandomly = true // hard coding this for now

  const [_, summaryData] = getInitialData<pluralitySummaryData>(
		votes, candidates, randomTiebreakOrder, 'ordinal',
		[
			makeBoundsTest(0, 1),
			makeAbstentionTest(0),
      ['nOvervotes', (ballot: number[]) => ballot.filter(v => v==1).length > 1]
		]
	);

  return runBlocTabulator<pluralityResults, pluralitySummaryData>(
		{
      votingMethod: 'Plurality',
      elected: [],
      tied: [],
      other: [],
      roundResults: [],
      summaryData: summaryData,
      tieBreakType: 'none',
    } as pluralityResults,
		nWinners,
		singleWinnerPlurality
  );
}

const singleWinnerPlurality = (scoresLeft: totalScore[], summaryData: pluralitySummaryData): roundResults => {
  const candidates = summaryData.candidates;

  let topScore = scoresLeft[0];
  let tiedCandidates = scoresLeft
    .filter(s => s.score == topScore.score)
    .map(s => candidates[s.index]);
  let winner = candidates[topScore.index];

  return {
    winners: [winner],
    runner_up: [],
    logs: (tiedCandidates.length == 1)? [
      `${winner.name} has the most votes and wins the round`
    ] : [
      `${commaListFormatter.format(tiedCandidates.map(c => c.name))} all tied with the most votes`,
      `${winner.name} wins the round after a random tiebreaker`
    ],
    tieBreakType: (tiedCandidates.length == 1)? 'none' : 'random',
    tied: tiedCandidates,
  };
}