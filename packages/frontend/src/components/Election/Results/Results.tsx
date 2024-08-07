import { Box, Grid, Paper } from "@mui/material";
import React from "react";
import MatrixViewer from "./MatrixViewer";
import IconButton from '@mui/material/IconButton'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import Typography from '@mui/material/Typography';
import { CHART_COLORS, DetailExpander, DetailExpanderGroup, ResultsBarChart, ResultsTable, Widget, WidgetContainer, useSubstitutedTranslation } from '../../util';
import STARResultSummaryWidget from "./STAR/STARResultSummaryWidget";
import STARDetailedResults from "./STAR/STARDetailedResults";
import STARResultDetailedStepsWidget from "./STAR/STARResultDetailedStepsWidget";
import WinnerResultTabs from "./WinnerResultTabs";
import { Race } from "@equal-vote/star-vote-shared/domain_model/Race";
import { ElectionResults, allocatedScoreResults, approvalResults, irvResults, pluralityResults, rankedRobinResults, starResults } from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import useElection from "../../ElectionContextProvider";
import { t } from "i18next";
import { Bar, BarChart, CartesianAxis, CartesianGrid, Cell, ComposedChart, Legend, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";

declare namespace Intl {
  class ListFormat {
    constructor(locales?: string | string[], options?: {});
    public format: (items: string[]) => string;
  }
}

const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

const GenericDetailedStepsWidget = ({ title, results, rounds}: {title: string, results: approvalResults|rankedRobinResults, rounds: number }) => {
  return <div className='detailedSteps'>
      {results.roundResults.map((round, r) => (
          <>
          {rounds > 1 && <Typography variant="h4">{`Winner ${r + 1}`}</Typography>}
          <ol>
              {round.logs.map(log => (<li>{log}</li>))}
          </ol>
          </>
      ))}
  </div>
}

function STARResultsViewer({ results, rounds, t, filterRandomFromLogs }: {results: starResults, rounds: number, t: Function, filterRandomFromLogs: boolean }) {
  let i = 0;
  const roundIndexes = Array.from({length: rounds}, () => i++);

  let noPrefStarData = results.summaryData.noPreferenceStars.map((count, i) => ({
    name: `${i}⭐`,
    count: count,
  }));

  return (
    <>
      <WinnerResultTabs numWinners={rounds}>
        {roundIndexes.map((i) => <STARResultSummaryWidget key={i} results={results} roundIndex={i} t={t}/>)}
      </WinnerResultTabs>
      <DetailExpander>
        <STARDetailedResults results={results} rounds={rounds} t={t}/>
        <DetailExpander level={1}>
          <WidgetContainer>
            <Widget title={t('results.star.detailed_steps_title')}>
              <STARResultDetailedStepsWidget results={results} rounds={rounds} t={t} filterRandomFromLogs={filterRandomFromLogs}/>
            </Widget>
            <Widget title={t('results.star.equal_preferences_title')}>
              <ResultsBarChart data={noPrefStarData} xKey='count' percentage={true} sortFunc={false}/>
            </Widget>
          </WidgetContainer>
        </DetailExpander>
      </DetailExpander>
    </>
  );
}

function RankedRobinResultsViewer({ results, t }: {results: rankedRobinResults, t: Function}) {
  return (<>
      <WidgetContainer>
      <Widget title={t('results.ranked_robin.bar_title')}>
        <ResultsBarChart
          data={
            results.summaryData.totalScores.map((totalScore, i) => ({
              name: results.summaryData.candidates[totalScore.index].name,
              votes: totalScore.score,
            }))
          }
          percentage
          percentDenominator={results.summaryData.candidates.length-1}
          star
        />
      </Widget>
    </WidgetContainer>

    <DetailExpander>
      <WidgetContainer>
        <Widget title={t('results.ranked_robin.table_title')}>
          <ResultsTable className='rankedRobinTable' data={[
            t('results.ranked_robin.table_columns'),
            ...results.summaryData.totalScores.map((totalScore, i) => [
              results.summaryData.candidates[totalScore.index].name,
              totalScore.score,
              `${Math.round(totalScore.score * 1000 / (results.summaryData.candidates.length-1)) / 10}%`,
            ])
          ]}/>
        </Widget>
      </WidgetContainer>
    </DetailExpander>
  </>
  );
}

function IRVResultsViewer({ results, t }: {results: irvResults, t: Function}) {
  const firstRoundData = results.voteCounts[0].map((c,i) => ({name: results.summaryData.candidates[i].name, votes: c}));

  const runoffData = results.voteCounts.slice(-1)[0]
    .map((c,i) => ({name: results.summaryData.candidates[i].name, votes: c}))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 2)
    .concat([{
      name: t('results.rcv.exhausted'),
      votes: results.exhaustedVoteCounts.slice(-1)[0]
    }])

  const tabulationRows = results.summaryData.candidates.map(({index, name}) => {
    return [name].concat(
      (results.voteCounts as Array<Number[]>).map(counts => counts[index] == 0? '' : '' + counts[index])
    )
  }).sort((r1, r2) => {
    let z1 = r1.filter(s => s == '').length;
    let z2 = r2.filter(s => s == '').length;
    if(z1 != z2)
      return z1-z2;

    for(let i = r1.length-1; i >= 1; i--){
      if(r1[i] == '') continue;
      if(r2[i] == '') continue;
      return parseInt(r2[i]) - parseInt(r1[i])
    }

    return 0;
  });

  tabulationRows.unshift([t('results.rcv.tabulation_candidate_column')].concat([...Array(results.voteCounts.length).keys()].map(i =>
    t('results.rcv.round_column', {n: i+1})
  )))
  tabulationRows.push([t('results.rcv.exhausted'), ...results.exhaustedVoteCounts.map(i => ''+i)])

  return (
    <>
      <WidgetContainer>
        <Widget title={t('results.rcv.first_choice_title')}>
          <ResultsBarChart data={firstRoundData} percentage majorityOffset/>
        </Widget>
        <Widget title={t('results.rcv.final_round_title')}>
          <ResultsBarChart data={runoffData} runoff star percentage sortFunc={false} majorityLegend={t('results.rcv.runoff_majority')}/>
        </Widget>
      </WidgetContainer>
      <DetailExpander>
        <WidgetContainer>
        <Widget title={t('results.rcv.table_title')}>
          <ResultsTable className='rcvTable' data={tabulationRows}/>
        </Widget>
        </WidgetContainer>
      </DetailExpander>
    </>
  );
}

function PluralityResultsViewer({ results, t }: {results: pluralityResults, t: Function}) {
  return (<>
    <WidgetContainer>
      <Widget title={t('results.choose_one.bar_title')}>
        <ResultsBarChart
          data={
            results.summaryData.totalScores.map((totalScore, i) => ({
              name: results.summaryData.candidates[totalScore.index].name,
              votes: totalScore.score,
            }))
          }
          star
          percentage
        />
      </Widget>
    </WidgetContainer>

    <DetailExpander>
      <WidgetContainer>
        <Widget title={t('results.choose_one.table_title')}>
          <ResultsTable className='chooseOneTable' data={[
            t('results.choose_one.table_columns'),
            ...results.summaryData.totalScores.map((totalScore, i) => [
              results.summaryData.candidates[totalScore.index].name,
              totalScore.score,
              `${Math.round(totalScore.score * 1000 / results.summaryData.nValidVotes) / 10}%`,
            ])
          ]}/>
        </Widget>
      </WidgetContainer>
    </DetailExpander>
  </>);
}


function ApprovalResultsViewer({ results , rounds, t}: {results: approvalResults, rounds: number, t: Function}) {
  return (<>
    <WidgetContainer>
      <Widget title={t('results.approval.bar_title')}>
        <ResultsBarChart
          data={
            results.summaryData.totalScores.map((totalScore, i) => ({
              name: results.summaryData.candidates[totalScore.index].name,
              votes: totalScore.score,
            }))
          }
          star
          percentage
          percentDenominator={results.summaryData.nValidVotes} 
        />
      </Widget>
    </WidgetContainer>

    <DetailExpander>
      <WidgetContainer>
        <Widget title={t('results.approval.table_title')}>
          <ResultsTable className='approvalTable' data={[
            t('results.approval.table_columns'),
            ...results.summaryData.totalScores.map((totalScore, i) => [
              results.summaryData.candidates[totalScore.index].name,
              totalScore.score,
              `${Math.round(totalScore.score * 1000 / results.summaryData.nValidVotes) / 10}%`,
            ])
          ]}/>
        </Widget>
      </WidgetContainer>
    </DetailExpander>
  </>);
}

function ResultViewer({ methodKey, results, children }:{methodKey: string, results:irvResults|pluralityResults|rankedRobinResults, children:any}) {
  const {t} = useSubstitutedTranslation();
  const learnLinkKey = `methods.${methodKey}.learn_link`
  const votingMethod = t(`methods.${methodKey}.full_name`)
  return (
    <Box className="resultViewer">
      {children}
      <Typography component="p" sx={{textAlign: 'right', color: '#808080', fontSize: '.8rem', marginTop: '20px'}}>
        {t('results.method_context', {voting_method: votingMethod})}
        {t(learnLinkKey) != learnLinkKey && <><br/><a href={t(learnLinkKey)} style={{color: 'inherit'}}>{t('results.learn_link_text', {voting_method: votingMethod})}</a></>}
      </Typography>
    </Box>
  );
}

function PRResultsViewer({ result, t }: {result: allocatedScoreResults, t: Function}) {

  return (
    <div>
      <h2>Summary</h2>
      <p>Voting Method: Proportional STAR Voting</p>
      <p>{`Winners: ${result.elected.map((winner) => winner.name).join(', ')}`}</p>
      <p>{`Number of voters: ${result.summaryData.nValidVotes}`}</p>
      <h2>Detailed Results</h2>
      <h3>Scores By Round</h3>
      <table className='matrix'>
        <thead className='matrix'>
          <tr className='matrix'>
            <th className='matrix'> Candidate</th>
            {result.elected.map((c, n) => (
              <th className='matrix' key={`h${n}`} >Round {n + 1} </th>
            ))}
          </tr>
        </thead>
        <tbody className='matrix'>
          {/* Loop over each candidate, for each loop over each round and return score */}
          {/* Data is stored in the transpose of the desired format which is why loops look weird */}
          {result.summaryData.weightedScoresByRound[0].map((col, cand_ind) => (
            <tr className='matrix' key={`d${cand_ind}`}>
              <th className='matrix' key={`dh${cand_ind}`} >{result.summaryData.candidates[cand_ind].name}</th>
              {result.summaryData.weightedScoresByRound.map((row, round_ind) => {
                const score = Math.round(result.summaryData.weightedScoresByRound[round_ind][cand_ind] * 10) / 10
                return (
                  result.elected[round_ind].index === result.summaryData.candidates[cand_ind].index ?
                    <td className='highlight' key={`c${cand_ind},${round_ind}`}>
                      <h3>{ score }</h3>
                    </td>
                    :
                    <td className='matrix' key={`c${cand_ind},${round_ind}`}>
                      <h3>{score}</h3>
                    </td>
                )
              }
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type ResultsProps = {
  title: string,
  raceIndex: number,
  race: Race,
  result: ElectionResults
}

export default function Results({ title, raceIndex, race, result }: ResultsProps) {
  const { election, voterAuth, refreshElection, permissions, updateElection } = useElection();
  let showTitleAsTie = ['random', 'five_star'].includes(result.results.tieBreakType);
  // added a null check for sandbox support
  let removeTieBreakFromTitle = (election?.settings.break_ties_randomly ?? false) && result.results.tieBreakType == 'random';
  const {t} = useSubstitutedTranslation(election?.settings?.term_type ?? 'poll');
  return (
    <div>
      <div className="flexContainer" style={{textAlign: 'center'}}>
        <Box sx={{pageBreakAfter:'avoid', pageBreakInside:'avoid'}}>
        {result.results.summaryData.nValidVotes == 0 && <h2>{t('results.waiting_for_results')}</h2>}
        {result.results.summaryData.nValidVotes == 1 && <p>{t('results.single_vote')}</p> }
        {result.results.summaryData.nValidVotes > 1 && <>
          {showTitleAsTie?
            <>
            <Typography variant="h5" sx={{fontWeight: 'bold'}}>{t('results.tie_title')}</Typography>
            {!removeTieBreakFromTitle && <Typography component="p" sx={{fontWeight: 'bold'}}>
                {t('results.tiebreak_subtitle', {names: formatter.format(result.results.elected.map(c => c.name))})}
            </Typography>}
            </>
          :
            <Typography variant="h5" sx={{fontWeight: 'bold'}}>{t('results.win_title', {names: formatter.format(result.results.elected.map(c => c.name))})}</Typography>
          }
          <Typography variant="h6">{t('results.vote_count', {n: result.results.summaryData.nValidVotes})}</Typography>
        </>}
        </Box>
        {result.results.summaryData.nValidVotes > 1 &&
          <>
          {result.votingMethod === "STAR" && <ResultViewer methodKey='star' results={result.results}>
              <STARResultsViewer results={result.results} rounds={race.num_winners} t={t} filterRandomFromLogs={removeTieBreakFromTitle}/>
          </ResultViewer> }

          {result.votingMethod === "Approval" && <ResultViewer methodKey='approval' results={result.results}>
            <ApprovalResultsViewer results={result.results} rounds={race.num_winners} t={t}/>
          </ResultViewer>}

          {result.votingMethod === "STAR_PR" &&
            <>
              {/* PR tabulator needs to be refactored to match interface of other methods */}
              {/* <SummaryViewer votingMethod='Proportional STAR' results={result} /> */}
              <PRResultsViewer result={result.results} t={t}/>
            </>}

          {result.votingMethod === "RankedRobin" &&
            <ResultViewer methodKey='ranked_robin' results={result.results}>
              <RankedRobinResultsViewer results={result.results} t={t}/>
            </ResultViewer>
          }

          {result.votingMethod === "Plurality" &&
            <ResultViewer methodKey='choose_one' results={result.results}>
              <PluralityResultsViewer results={result.results} t={t}/>
            </ResultViewer>
          }


          {result.votingMethod === "IRV" &&
            <ResultViewer methodKey='rcv' results={result.results}>
              <IRVResultsViewer results={result.results} t={t}/>
            </ResultViewer>
          }
        </>}
      </div>
    </div>
  );
}
