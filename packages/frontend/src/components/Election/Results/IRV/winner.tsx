/*
  Describe, to the default level of detail, how the IRV (Ware) tally found a
  winner.
*/

import Typography from '@mui/material/Typography';
import WidgetContainer from '../components/WidgetContainer';
import Widget from '../components/Widget';
import {
  irvRoundResults
} from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import ResultsBarChart from "../components/ResultsBarChart";
import { irvContext, irvWinnerSearch } from "./ifc";

const chartDataFrom = (
  {context, round}: {
    context: irvContext,
    round: irvRoundResults
  }
) => {
  const {candidatesByIndex} = context;
  return round.standings.map(
    ({ candidateIndex, hareScore }) =>
    ({ name: candidatesByIndex[candidateIndex].name, votes: hareScore })
  )
};

export function IRVWinnerView ( {win, context}:{
  win: irvWinnerSearch, context: irvContext
}) {
  const {t} = context;

  const firstRoundData = chartDataFrom({context, round: win.firstRound});
  const runoffData = [
    ...chartDataFrom({context, round: win.lastRound}),
    {
      name: t('results.rcv.exhausted'),
      votes: win.lastRound.exhaustedVoteCount
    }
  ];

  return <WidgetContainer>
    <Widget title={t('results.rcv.first_choice_title')}>
      <ResultsBarChart data={firstRoundData} percentage majorityOffset/>
    </Widget>
    <Widget title={t('results.rcv.final_round_title')}>
      < ResultsBarChart
        data={runoffData} runoff stars={1} percentage sortFunc={false}
        majorityLegend={t('results.rcv.runoff_majority')}
      />
    </Widget>
  </WidgetContainer>
}
