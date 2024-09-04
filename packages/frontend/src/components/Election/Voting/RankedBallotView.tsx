import React, { useContext, useMemo, useCallback } from 'react';
import { BallotContext } from './VotePage'; 
import GenericBallotView from './GenericBallotView/GenericBallotView'; 
import { useSubstitutedTranslation } from '~/components/util'; 


export default function RankedBallotView({ onlyGrid = false }) {
  const ballotContext = useContext(BallotContext);
  const { t } = useSubstitutedTranslation();


  // disabling warnings until we have a better solution, see slack convo
  // https://starvoting.slack.com/archives/C01EBAT283H/p1677023113477139
  // if(race.voting_method == 'IRV' && scoresAreOverVote({scores: scores})){
  //   warning=(
  //     <>
  //     Giving multiple candidates the same ranking is not recommended in IRV.<br/>
  //     This could result in your ballot getting exhausted early
  //     </>
  //   )
  //  }  

  const maxRankings = useMemo(() => {
    if (ballotContext.maxRankings) {
      return Math.min(ballotContext.maxRankings, Number(process.env.REACT_APP_MAX_BALLOT_RANKS));
    } else {
      return Number(process.env.REACT_APP_DEFAULT_BALLOT_RANKS);
    }
  }, [ballotContext.maxRankings]);

  const race = ballotContext.race;
  const scores = useMemo(() => ballotContext.candidates.map(candidate => candidate.score), [ballotContext]);

  const skippedColumns = useMemo(() => {
    const skippedColumns = [];
    for (let i = 1; i <= maxRankings; i++) {
      if (!scores.includes(i) && scores.some(score => score > i)) {
        skippedColumns.push(i);
      }
    }
    return skippedColumns;
  }, [scores, maxRankings]);
  const matchingScores = useMemo(() => {
    const scoreMap = new Map();
  
    // Populate the map with indexes for each score
    scores.forEach((score, index) => {
      if (scoreMap.has(score)) {
        scoreMap.get(score).push(index);
      } else if (score) {
        scoreMap.set(score, [index]);
      }
    });
  
    // Filter out entries with only one index
    const matchingScores = []
    scoreMap.forEach((indexes, score) => {
      if (indexes.length > 1) {
        indexes.map(index => matchingScores.push([index, score]))
      }
    });

    return matchingScores
  }, [scores]);
  const warnings = useMemo(() => {
    const warnings = [];
    if (skippedColumns.length) {
      warnings.push({ message: t('ballot.methods.rcv.skipped_rank_warning'), color: 'brand.goldTransparent20' });
    } 
    if (matchingScores.length) {
      warnings.push({ message: t('ballot.methods.rcv.duplicate_rank_warning'), color: 'brand.red' });
    }
    return warnings;
  }, [skippedColumns, matchingScores, t]);
  const onClick = useCallback((candidateIndex, columnValue) => {
    // If the candidate already has the score, remove it. Otherwise, set it with the new score.
    scores[candidateIndex] = scores[candidateIndex] === columnValue ? null : columnValue;

    ballotContext.onUpdate(scores);
  }, [scores, race.voting_method, ballotContext]);



  const columnValues = useMemo(() => {
    return ballotContext.candidates.slice(0, maxRankings).map((c, i) => i + 1);
  }, [ballotContext.candidates, maxRankings]);

  const columns = useMemo(() => {
    return columnValues.map(v => t('number.rank', { count: v, ordinal: true }));
  }, [columnValues, t]);

  return (
    <GenericBallotView
      key="rankedBallot"
      methodKey={
        (ballotContext.race.voting_method === 'IRV' ? 'rcv' : '') +
        (ballotContext.race.voting_method === 'RankedRobin' ? 'ranked_robin' : '')
      }
      columnValues={columnValues}
      columns={columns}
      onClick={onClick}
      warnings={warnings}
      onlyGrid={onlyGrid}
      warningColumns={skippedColumns}
      alertBubbles={matchingScores}
    />
  );
}