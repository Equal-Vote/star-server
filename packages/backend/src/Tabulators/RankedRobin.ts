import { ballot, candidate, rankedRobinResults, rankedRobinSummaryData, roundResults, totalScore } from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import { sortByTieBreakOrder } from "./Star";
import { getInitialData, makeAbstentionTest, makeBoundsTest, runBlocTabulator, sortTotalScores } from "./Util";
import { ElectionSettings } from "@equal-vote/star-vote-shared/domain_model/ElectionSettings";

export function RankedRobin(candidates: string[], votes: ballot[], nWinners = 1, randomTiebreakOrder:number[] = [], breakTiesRandomly = true, electionSettings?:ElectionSettings) {
  breakTiesRandomly = true // hard coding this for now

  const [_, summaryData] = getInitialData<rankedRobinSummaryData>(
		votes, candidates, randomTiebreakOrder, 'ordinal',
		[
			makeBoundsTest(0, electionSettings?.max_rankings ?? Infinity), 
			makeAbstentionTest(null),
		]
	);

  return runBlocTabulator<rankedRobinResults, rankedRobinSummaryData>(
		{
      votingMethod: 'RankedRobin',
      elected: [],
      tied: [],
      other: [],
      roundResults: [],
      summaryData: summaryData,
      tieBreakType: 'none',
    } as rankedRobinResults,
		nWinners,
		singleWinnerRankedRobin
  );
}

const singleWinnerRankedRobin = (remainingCandidates: candidate[], summaryData: rankedRobinSummaryData): roundResults => {
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
  // Break Tie Randomly
  const randomWinner = sortByTieBreakOrder(winners)[0]
  roundResults.winners.push(randomWinner)
  roundResults.logs.push(`${winners[0].name} picked in random tie-breaker, more robust tiebreaker not yet implemented.`)
  return roundResults
}

function getWinners(summaryData: rankedRobinSummaryData, eligibleCandidates: candidate[]) {
  // Get HeadToHead wins (this relies on filter maintaining the relative sort from totalScores)
  const sortedHeadToHeadWins: totalScore[] = summaryData.totalScores.filter(t => eligibleCandidates.find(c => c.index == t.index) != undefined)
  sortedHeadToHeadWins.sort((a:totalScore, b:totalScore) => -(a.score-b.score));

  // Return all candidates that tie for top score
  return sortedHeadToHeadWins
    .filter(t => t.score == sortedHeadToHeadWins[0].score)
    .map(t => summaryData.candidates[t.index]);
}