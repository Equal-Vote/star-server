import { Box, Pagination } from "@mui/material";
import React, { useRef } from "react";
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import { commaListFormatter, useSubstitutedTranslation } from '../../util';
import STARResultSummaryWidget from "./STAR/STARResultSummaryWidget";
import STARDetailedResults from "./STAR/STARDetailedResults";
import STARResultDetailedStepsWidget from "./STAR/STARResultDetailedStepsWidget";
import WinnerResultTabs from "./WinnerResultTabs";
import { Race } from "@equal-vote/star-vote-shared/domain_model/Race";
import { allocatedScoreResults, approvalResults, ElectionResults, irvResults, rankedRobinResults, starResults } from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import useElection from "../../ElectionContextProvider";
import DetailExpander from "./components/DetailExpander";
import ResultsTable from "./components/ResultsTable";
import Widget from "./components/Widget";
import WidgetContainer from "./components/WidgetContainer";
import ResultsBarChart from "./components/ResultsBarChart";
import HeadToHeadWidget from "./components/HeadToHeadWidget";
import useRace, { RaceContextProvider } from "~/components/RaceContextProvider";
import VoterProfileWidget from "./components/VoterProfileWidget";
import { Candidate } from "@equal-vote/star-vote-shared/domain_model/Candidate";
import VoterIntentWidget from "./components/VoterIntentWidget";
import ColumnDistributionWidget from "./components/ColumnDistributionWidget";
import NameRecognitionWidget from "./components/NameRecognitionWidget";
import ScoreRangeWidget from "./components/ScoreRangeWidget";
import useFeatureFlags from "~/components/FeatureFlagContextProvider";
import STAREqualPreferencesWidget from "./STAR/STAREqualPreferencesWidget";
import VoterErrorStatsWidget from "./components/VoterErrorStatsWidget";

function STARResultsViewer({ filterRandomFromLogs }: {filterRandomFromLogs: boolean }) {
  let i = 0;
  let {results, t, race} = useRace();
  const rounds = race.num_winners;
  const roundIndexes = Array.from({length: rounds}, () => i++);
  results = results as starResults;


  const sortedCandidates = race.candidates
    .map(c => ({...c, index: results.summaryData.candidates.find(cc => cc.name == c.candidate_name).index}))
    .sort((a, b) => 
      -(results.summaryData.totalScores.find(s => s.index == a.index).score -
        results.summaryData.totalScores.find(s => s.index == b.index).score)
    )
    .map(c => ({candidate_id: c.candidate_id, candidate_name: c.candidate_name}));

  return <ResultsViewer methodKey='star'>
    <WinnerResultTabs numWinners={rounds}>
      {roundIndexes.map((i) => <STARResultSummaryWidget key={i} results={results} roundIndex={i} t={t}/>)}
    </WinnerResultTabs>
    {rounds == 1 &&
      <DetailExpander>
        <STARDetailedResults/>
        <DetailExpander level={1}>
          <WidgetContainer>
            <Widget title={t('results.star.detailed_steps_title')}>
              <STARResultDetailedStepsWidget results={results} rounds={rounds} t={t} filterRandomFromLogs={filterRandomFromLogs}/>
            </Widget>
            <STAREqualPreferencesWidget frontRunners={sortedCandidates.slice(0, 2)}/>
            <HeadToHeadWidget candidates={sortedCandidates}/>
            <VoterProfileWidget candidates={sortedCandidates} topScore={5} frontRunners={sortedCandidates.slice(0, 2) as [Candidate, Candidate]}/>
            <ColumnDistributionWidget/>
            <NameRecognitionWidget/>
            <ScoreRangeWidget/>
          </WidgetContainer>
        </DetailExpander>
      </DetailExpander>
    }
    {rounds > 1 &&
      <DetailExpander>
          <WidgetContainer>
            <Widget wide title={t('results.star.detailed_steps_title')}> 
              <STARResultDetailedStepsWidget results={results} rounds={rounds} t={t} filterRandomFromLogs={filterRandomFromLogs}/>
            </Widget>
          </WidgetContainer>
      </DetailExpander>
    }
  </ResultsViewer>
}

function RankedRobinResultsViewer() {
  let {results, race, t} = useRace();
  results = results as rankedRobinResults;

  let sortedCandidates = race.candidates
    .map(c => ({...c, index: results.summaryData.candidates.find(cc => cc.name == c.candidate_name).index}))
    .sort((a, b) => 
      -(results.summaryData.totalScores.find(s => s.index == a.index).score -
        results.summaryData.totalScores.find(s => s.index == b.index).score)
    )
    .map(c => ({candidate_id: c.candidate_id, candidate_name: c.candidate_name}))

  return <ResultsViewer methodKey='ranked_robin'>
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
        <HeadToHeadWidget ranked candidates={sortedCandidates}/>
        <VoterProfileWidget candidates={sortedCandidates} topScore={1} ranked frontRunners={sortedCandidates.slice(0, 2) as [Candidate, Candidate]}/>
      </WidgetContainer>
    </DetailExpander>
  </ResultsViewer>
}

function IRVResultsViewer() {
  let {results, t, race} = useRace();
  results = results as irvResults;

  const firstRoundData = results.voteCounts[0].map((c,i) => ({name: results.summaryData.candidates[i].name, votes: c}));

  const runoffData = results.voteCounts.slice(-1)[0]
    .map((c,i) => ({name: results.summaryData.candidates[i].name, votes: c}))
    .sort((a, b) => b.votes - a.votes)
    .filter(a => a.votes != 0) // filter out eliminated candidates
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

  const sortedCandidates = race.candidates
    .map(c => ({...c, index: results.summaryData.candidates.find(cc => cc.name == c.candidate_name).index}))
    .sort((a, b) => {
      // prioritize ranking in later rounds, but use previous rounds as tiebreaker
      let i = results.voteCounts.length-1;
      while(i >= 0){
        let diff = -(results.voteCounts[i][a.index] - results.voteCounts[i][b.index]);
        if(diff != 0) return diff;
        i--;
      }
      return 0;
    })
    .map(c => ({candidate_id: c.candidate_id, candidate_name: c.candidate_name}));

  const eliminationOrderById = race.candidates
    .map(c => ({...c, index: results.summaryData.candidates.find(cc => cc.name == c.candidate_name).index}))
    .filter(c => results.voteCounts.at(-1)[c.index] == 0)
    .sort((a, b) => {
      // prioritize ranking in later rounds, but use previous rounds as tiebreaker
      let i = results.voteCounts.length-1;
      while(i >= 0){
        let diff = -(results.voteCounts[i][a.index] - results.voteCounts[i][b.index]);
        if(diff != 0) return diff;
        i--;
      }
      return 0;
    })
    .map(c => c.candidate_id)
    .reverse();

  return <ResultsViewer methodKey='rcv'>
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
      <DetailExpander level={1}>
        <WidgetContainer>
          <VoterIntentWidget eliminationOrderById={eliminationOrderById} winnerId={sortedCandidates[0].candidate_id}/>
          <VoterErrorStatsWidget/>
        </WidgetContainer>
        <WidgetContainer>
          <HeadToHeadWidget ranked candidates={sortedCandidates}/>
          <VoterProfileWidget candidates={sortedCandidates} topScore={1} ranked frontRunners={sortedCandidates.slice(0, 2) as [Candidate, Candidate]}/>
          <ColumnDistributionWidget/>
        </WidgetContainer>
      </DetailExpander>
    </DetailExpander>
  </ResultsViewer>
}

function PluralityResultsViewer() {
  let {results, t} = useRace();
  results = results as irvResults;

  return <ResultsViewer methodKey='choose_one'>
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
              `${Math.round(totalScore.score * 1000 / results.summaryData.nTallyVotes) / 10}%`,
            ])
          ]}/>
        </Widget>
      </WidgetContainer>
    </DetailExpander>
  </ResultsViewer>
}

function ApprovalResultsViewer() {
  let {results, race, t} = useRace();
  results = results as approvalResults;

  const sortedCandidates = race.candidates
    .map(c => ({...c, index: results.summaryData.candidates.find(cc => cc.name == c.candidate_name).index}))
    .sort((a, b) => 
      -(results.summaryData.totalScores.find(s => s.index == a.index).score -
        results.summaryData.totalScores.find(s => s.index == b.index).score)
    )
    .map(c => ({candidate_id: c.candidate_id, candidate_name: c.candidate_name}));

  return <ResultsViewer methodKey='approval'>
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
          percentDenominator={results.summaryData.nTallyVotes} 
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
              `${Math.round(totalScore.score * 1000 / results.summaryData.nTallyVotes) / 10}%`,
            ])
          ]}/>
        </Widget>
      </WidgetContainer>

      <DetailExpander level={1}>
        <WidgetContainer>
          <HeadToHeadWidget candidates={sortedCandidates}/>
          <VoterProfileWidget candidates={sortedCandidates} topScore={1} frontRunners={sortedCandidates.slice(0, 2) as [Candidate, Candidate]}/>
        </WidgetContainer>
        <WidgetContainer>
          <ColumnDistributionWidget/>
        </WidgetContainer>
      </DetailExpander>
    </DetailExpander>
  </ResultsViewer>
}

function ResultsViewer({ methodKey, children }:{methodKey: string, children:any}) {
  const {t, i18n} = useSubstitutedTranslation();
  const learnLinkKey = `methods.${methodKey}.learn_link`
  const votingMethod = t(`methods.${methodKey}.full_name`)
  return (
    <Box className="resultViewer">
      {children}
      <Typography component="p" sx={{textAlign: 'right', color: '#808080', fontSize: '.8rem', marginTop: '20px'}}>
        {t('results.method_context', {voting_method: votingMethod})}
        {i18n.exists(learnLinkKey) && <><br/><a href={t(learnLinkKey)} style={{color: 'inherit'}}>{t('results.learn_link_text', {voting_method: votingMethod})}</a></>}
      </Typography>
    </Box>
  );
}

function STARPRResultsViewer() {
  const flags = useFeatureFlags();
  let {results, t, race} = useRace();
  results = results as allocatedScoreResults;
  const [page, setPage] = useState(1);
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const tabulationRows = results.summaryData.candidates.map(({index, name}) => {
    return [name].concat(
      (results.summaryData.weightedScoresByRound as Array<number[]>).map(counts => counts[index] == 0? '' : '' + Math.round(counts[index]*10)/10)
    )
  });

  tabulationRows.unshift([t('results.star_pr.table_columns')].concat([...Array(results.summaryData.weightedScoresByRound.length).keys()].map(i =>
    t('results.star_pr.round_column', {n: i+1})
  )))

  const winIndex = (aa) => {
    let i = results.elected.findIndex(e => e.index == aa.index);
    if(i == -1) return results.elected.length;
    return i;
  }
  const sortedCandidates = race.candidates
    .map(c => ({...c, index: results.summaryData.candidates.find(cc => cc.name == c.candidate_name).index}))
    .sort((a, b) => {
      const finalScore = (aa) => results.summaryData.weightedScoresByRound.slice(-1)[0][aa.index]
      if(winIndex(a) != winIndex(b)) return winIndex(a) - winIndex(b);
      return -(finalScore(a) - finalScore(b));
    })
    .map(c => ({candidate_id: c.candidate_id, candidate_name: c.candidate_name}));

  let remainingVoters = (results.summaryData.nTallyVotes*(1 - ((page-1)/results.summaryData.weightedScoresByRound.length)))
  remainingVoters = Math.round(remainingVoters*10)/10;
  return <ResultsViewer methodKey='star_pr'>
    <WidgetContainer>
      <Widget title={t('results.star_pr.chart_title')} wide>
        <Typography>
          Total scores for the {remainingVoters} remaining unrepresented voters
        </Typography>
        <ResultsBarChart
          data={
            results.summaryData.weightedScoresByRound[page-1].map((totalScore, i) => ({
              name: results.summaryData.candidates[i].name,
              votes: Math.round(totalScore*10)/10,
              label: winIndex(results.summaryData.candidates[i]) < page-1 ? '(elected)' : undefined,
              star: winIndex(results.summaryData.candidates[i]) < page,
              // a bit hacky using candidate_name but oh well
              sortIndex: sortedCandidates.findIndex((c) => c.candidate_name == results.summaryData.candidates[i].name)
            }))
          }
          sortFunc = {(a, b) => a.sortIndex - b.sortIndex}
          maxBarSize = {results.summaryData.weightedScoresByRound[0].reduce(
            (prev, totalScore) => Math.max(prev, totalScore), 0
          )}
        />
        <Pagination count={results.summaryData.weightedScoresByRound.length} page={page} onChange={handleChange} />
      </Widget>
    </WidgetContainer>
    <DetailExpander>
      <WidgetContainer>
        <Widget title={t('results.star_pr.table_title')} wide>
          <ResultsTable className='starPRTable' data={tabulationRows}/>
        </Widget>
      </WidgetContainer>
      <WidgetContainer>
        <Widget title={t('results.star.detailed_steps_title')} wide>
          <div className='detailedSteps'>
            <ol style={{textAlign: 'left'}}>
                {results.logs.map((log, i) => (<li key={i}>
                    {typeof log === 'string' ? log : t(log['key'], log)}
                </li>))}
            </ol>
          </div>
        </Widget>
      </WidgetContainer>
      <DetailExpander level={1}>
        <WidgetContainer>
          <HeadToHeadWidget candidates={sortedCandidates}/>
          <VoterProfileWidget candidates={sortedCandidates} topScore={5} frontRunners={sortedCandidates.slice(0, 2) as [Candidate, Candidate]}/>
        </WidgetContainer>
        <WidgetContainer>
          <ColumnDistributionWidget/>
          <NameRecognitionWidget/>
          <ScoreRangeWidget/>
        </WidgetContainer>
      </DetailExpander>
    </DetailExpander>
  </ResultsViewer>
}

function STVResultsViewer() {
  const flags = useFeatureFlags();
  let {results, t, race} = useRace();
  results = results as irvResults;

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

  return <ResultsViewer methodKey='stv'>
    <WidgetContainer>
      <Widget title={t('results.stv.table_title')}>
        <ResultsTable className='rcvTable' data={tabulationRows}/>
      </Widget>
    </WidgetContainer>
  </ResultsViewer>
}

export default function Results({ race, results }: {race: Race, results: ElectionResults}) {
  const { election } = useElection();
  let showTitleAsTie = ['random', 'five_star'].includes(results.tieBreakType);
  // added a null check for sandbox support
  let removeTieBreakFromTitle = (election?.settings.break_ties_randomly ?? false) && results.tieBreakType == 'random';

  const {t} = useSubstitutedTranslation(election?.settings?.term_type ?? 'election', {
    methodKey: {
      'STAR': 'star',
      'Approval': 'approval',
      'Plurality': 'choose_one',
      'IRV': 'rcv',
      'STV': 'stv',
      'STAR_PR': 'star_pr',
      'RankedRobin': 'ranked_robin',
    }[results.votingMethod]
  });

  const winnersText = commaListFormatter
    .format(results.elected.map(c => c.name.replace(' ', '__REPLACE_ME__')))
    .split('__REPLACE_ME__')
    .map((s,i) => ([<React.Fragment key={i*2}>{s}</React.Fragment>, <React.Fragment key={i*2+1}>&nbsp;</React.Fragment>]))
    .flat()

  return (
    <RaceContextProvider race={race} results={results} t={t}>
      <hr/>
      <Typography variant="h3" component="h3" sx={{marginBottom: 2}}>
          {race.title}
      </Typography>
      <div className="flexContainer" style={{textAlign: 'center'}}>
        <Box sx={{pageBreakAfter:'avoid', pageBreakInside:'avoid', mx: 10}}>
        {results.summaryData.nTallyVotes == 0 && <h2>{t('results.waiting_for_results')}</h2>}
        {results.summaryData.nTallyVotes == 1 && <p>{t('results.single_vote')}</p> }
        {results.summaryData.nTallyVotes > 1 && <>
          {showTitleAsTie?
            <>
            <Typography variant="h5" sx={{fontWeight: 'bold'}}>{t('results.tie_title')}</Typography>
            {!removeTieBreakFromTitle && <Typography component="p" sx={{fontWeight: 'bold'}}>
                {t('results.tiebreak_subtitle', {names: commaListFormatter.format(results.elected.map(c => c.name))})}
            </Typography>}
            </>
          :
            <Typography variant='h5'>⭐ {winnersText}{t('results.win_title_postfix', {count: results.elected.length})} ⭐</Typography>
          }
          <Typography variant="h6">{t('results.vote_count', {n: results.summaryData.nTallyVotes})}</Typography>
        </>}
        </Box>
        {results.summaryData.nTallyVotes > 1 &&
          <>
          {results.votingMethod === "STAR" && <STARResultsViewer filterRandomFromLogs={removeTieBreakFromTitle}/>}
          {results.votingMethod === "Approval" && <ApprovalResultsViewer/>}
          {results.votingMethod === "RankedRobin" && <RankedRobinResultsViewer/>}
          {results.votingMethod === "Plurality" && <PluralityResultsViewer/>}
          {results.votingMethod === "IRV" && <IRVResultsViewer/>}
          {results.votingMethod === "STV" && <STVResultsViewer/>}
          {results.votingMethod === "STAR_PR" && <STARPRResultsViewer/>}
        </>}
      </div>
    </RaceContextProvider>
  );
}
