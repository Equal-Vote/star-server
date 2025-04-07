/*
  Display info about an individual round of tallying.
*/

import {
  irvRoundResults
} from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import ResultsBarChart from "../components/ResultsBarChart";
import { irvContext } from "./ifc";

export function IRVRoundView (
  {round, context}: {
    round: irvRoundResults,
    context: irvContext
  }
) {
  const {candidatesByIndex, t} = context;
  let chartData = round.standings.map(
    ({ candidateIndex, hareScore }) =>
    ({ name: candidatesByIndex[candidateIndex].name, votes: hareScore })
  );
  if (! round.isStartOfSearch) {
    chartData = chartData.concat([{
      name: t('results.rcv.exhausted'),
      votes: round.exhaustedVoteCount
    }]);
  }
  let haveWinner: boolean = ! ! round.winners.length;
  return < ResultsBarChart
    data={chartData} star={haveWinner} sortFunc={false} percentage
    majorityLegend={t('results.rcv.runoff_majority')}
  />
}
