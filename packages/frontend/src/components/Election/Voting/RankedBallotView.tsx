import React, { useContext, useMemo, useCallback, useEffect, useState } from 'react';
import { BallotContext } from './VotePage'; 
import GenericBallotView from './GenericBallotView/GenericBallotView'; 
import { useSubstitutedTranslation } from '~/components/util'; 
import { use } from 'i18next';
import { ca } from 'date-fns/locale';
import { set } from 'date-fns';
import { get } from 'http';


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
  const findSkippedColumns = useCallback((scores: number[]): number[] => {
    const skippedColumns: number[] = [];
    for (let i = 1; i <= maxRankings; i++) {
      if (!scores.includes(i) && scores.some(score => score > i)) {
        skippedColumns.push(i);
      }
    }
    return skippedColumns;
  }, [maxRankings]);
    const findMatchingScores = useCallback((scores: number[]): [number, number][] => {
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
    const matchingScores= []
    scoreMap.forEach((indexes, score) => {
      if (indexes.length > 1) {
        indexes.map(index => matchingScores.push([index, score]))
      }
    });

    return matchingScores
  }, []);
   const getWarnings = useCallback((skippedColumns, matchingScores):{severity: 'warning' | 'error', message:string}[] => {
    const warnings: {severity: 'warning' | 'error', message:string}[] = [];
    if (skippedColumns.length) {
      warnings.push({ message: t('ballot.methods.rcv.skipped_rank_warning'), severity: "warning" });
    } 
    if (matchingScores.length) {
      warnings.push({ message: t('ballot.methods.rcv.duplicate_rank_warning'), severity: "error" });
    }
    return warnings;
  }, [t]);
 const race = useMemo(() => ballotContext.race, [ballotContext.race]);
  const [skippedColumns, setSkippedColumns] = useState(findSkippedColumns(ballotContext.candidates.map((c) => c.score)));
  const [matchingScores, setMatchingScores] = useState(findMatchingScores(ballotContext.candidates.map((c) => c.score)));
  const [warnings, setWarnings] = useState(getWarnings(skippedColumns, matchingScores));


  const onClick = useCallback((candidateIndex, columnValue) => {
    // If the candidate already has the score, remove it. Otherwise, set it with the new score.
    const scores = ballotContext.candidates.map((candidate) => candidate.score);
    scores[candidateIndex] = scores[candidateIndex] === columnValue ? null : columnValue;
    if (ballotContext.race.voting_method === 'IRV') {
      const skippedColumns = findSkippedColumns(scores);
      const matchingScores = findMatchingScores(scores);
      const warnings = getWarnings(skippedColumns, matchingScores);
      setSkippedColumns(skippedColumns);
      setMatchingScores(matchingScores);
      setWarnings(warnings);
      if (warnings.length) {
        ballotContext.setHasAlert(true);
      } else {
        ballotContext.setHasAlert(false);
      }
    }
    ballotContext.onUpdate(scores);
  }, [race.voting_method, ballotContext]);


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