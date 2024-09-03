import React, { useCallback, useContext, useMemo } from "react";
import Typography from '@mui/material/Typography';
import { BallotContext } from "./VotePage";
import GenericBallotView from "./GenericBallotView";
import { useSubstitutedTranslation } from "~/components/util";



// Renders a complete RCV ballot for a single race
export default function RankedBallotView({onlyGrid=false}) {
  const ballotContext = useContext(BallotContext);

  let warning = null;

  // disabling warnings until we have a better solution, see slack convo
  // https://starvoting.slack.com/archives/C01EBAT283H/p1677023113477139
  const race = ballotContext.race;
  const scores = ballotContext.candidates.map(c => c.score);
  
  const onClick = useCallback((candidateIndex, columnValue) => {
    const newScores = ballotContext.candidates.map(candidate => candidate.score);
    const duplicateScoreIndex = newScores.indexOf(columnValue);
    if (duplicateScoreIndex !== -1 && duplicateScoreIndex !== candidateIndex && race.voting_method === 'RankedChoice') {
      newScores[duplicateScoreIndex] = null;
    }
    // If the candidate already has the score, remove it. Otherwise, set it with the new score.
    newScores[candidateIndex] = newScores[candidateIndex] === columnValue ? null : columnValue;
    
    ballotContext.onUpdate(newScores);
  }, [ballotContext]);


  const { t } = useSubstitutedTranslation();
  const maxRankings = useMemo(() => {
    if (ballotContext.maxRankings) {
      return Math.min(ballotContext.maxRankings, Number(process.env.REACT_APP_MAX_BALLOT_RANKS));
    } else {
      return Number(process.env.REACT_APP_DEFAULT_BALLOT_RANKS);
    }
  }, [ballotContext.maxRankings]);
  const columnValues = useMemo (() => { 
    return ballotContext.candidates.slice(0, maxRankings).map((c, i) => i+1)
  }, [ballotContext.candidates, maxRankings]);
  const columns = useMemo (() => {
    return columnValues.map(v => t('number.rank', {count: v, ordinal: true}))
}, [columnValues, t]);
    return (
    <GenericBallotView
      key="rankedBallot"
      methodKey={
        (ballotContext.race.voting_method == 'IRV' ? 'rcv' : '') + 
        (ballotContext.race.voting_method == 'RankedRobin' ? 'ranked_robin' : '')
      }
      columnValues={columnValues}
      columns={columns}
      onClick={onClick}
      warning={warning}
      onlyGrid={onlyGrid}
    />
  );
}
