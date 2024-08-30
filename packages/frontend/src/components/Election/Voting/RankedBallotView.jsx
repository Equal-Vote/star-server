import React, { useContext } from "react";
import Typography from '@mui/material/Typography';
import { BallotContext } from "./VotePage";
import GenericBallotView from "./GenericBallotView";
import { useSubstitutedTranslation } from "~/components/util";

function scoresAreOverVote({scores}){
  let uniqueScores = new Set();
  for(let i = 0; i < scores.length; i++){
    if(scores[i] == null) continue;
    if(uniqueScores.has(scores[i])) return true;
    uniqueScores.add(scores[i]);
  }
  return false;
}

// Renders a complete RCV ballot for a single race
export default function RankedBallotView({onlyGrid=false}) {
  const ballotContext = useContext(BallotContext);

  let warning = null;

  // disabling warnings until we have a better solution, see slack convo
  // https://starvoting.slack.com/archives/C01EBAT283H/p1677023113477139
  //if(race.voting_method == 'IRV' && scoresAreOverVote({scores: scores})){
  //  warning=(
  //    <>
  //    Giving multiple candidates the same ranking is not recommended in IRV.<br/>
  //    This could result in your ballot getting exhausted early
  //    </>
  //  )
  //}


  const { t } = useSubstitutedTranslation();
  
  let columnValues = ballotContext.candidates.slice(0, ballotContext.maxRankings).map((c, i) => i+1)
  let columns = columnValues.map(v => t('number.rank', {count: v, ordinal: true}))
  debugger;
  return (
    <GenericBallotView
      key="rankedBallot"
      methodKey={
        (ballotContext.race.voting_method == 'IRV' ? 'rcv' : '') + 
        (ballotContext.race.voting_method == 'RankedRobin' ? 'ranked_robin' : '')
      }
      columnValues={columnValues}
      columns={columns}
      onClick={(i, j) => {
        const newScores = ballotContext.candidates.map(c => c.score);
        newScores[i] = newScores[i] === j ? null : j;
        ballotContext.onUpdate(newScores);
      }}
      warning={warning}
      onlyGrid={onlyGrid}
    />
  );
}
