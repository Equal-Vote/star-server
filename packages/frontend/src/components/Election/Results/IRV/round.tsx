/*
  Display info about an individual round of tallying.
*/

import {
  irvRoundResults /* , candidate */
} from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import ResultsBarChart from "../components/ResultsBarChart";

export function IRVRound (
  {
    round,
    candidatesByIndex,
    t, /* International translator */
  }: {
    round: irvRoundResults,
    candidatesByIndex: {name: string}[],
    t: Function /* (first: string, ...rest: any[]) => string */
  }
) {
  let chartData = round.standings.map(
    ({ candidateIndex, hareScore }) =>
    ({ name: candidatesByIndex[candidateIndex].name, votes: hareScore })
  ).concat([{
    name: t('results.rcv.exhausted'),
    votes: round.exhaustedVoteCount
  }]);
  let haveWinner: boolean = ! ! round.winners.length;
  return < ResultsBarChart
    data={chartData} star={haveWinner} sortFunc={false}
    majorityLegend={t('results.rcv.runoff_majority')}
  />
}
