import { Box, Grid, Paper } from "@mui/material";
import React from "react";
import MatrixViewer from "./MatrixViewer";
import IconButton from '@mui/material/IconButton'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import Typography from '@mui/material/Typography';
import { DetailExpander, DetailExpanderGroup, Widget, WidgetContainer, makeResultTable } from '../../util';
import STARResultSummaryWidget from "./STAR/STARResultSummaryWidget";
import STARDetailedResults from "./STAR/STARDetailedResults";
import STARResultDetailedStepsWidget from "./STAR/STARResultDetailedStepsWidget";
import WinnerResultTabs from "./WinnerResultTabs";
import ApprovalResultSummaryWidget from "./Approval/ApprovalResultSummaryWidget";
import { Race } from "shared/domain_model/Race";
import { ElectionResults, allocatedScoreResults, approvalResults, irvResults, pluralityResults, rankedRobinResults, starResults } from "shared/domain_model/ITabulators";
import useElection from "../../ElectionContextProvider";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";

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

function STARResultViewer({ results, rounds }: {results: starResults, rounds: number }) {
  let i = 0;
  const roundIndexes = Array.from({length: rounds}, () => i++);

  let noPrefStarData = results.summaryData.noPreferenceStars.map((count, i) => ({
    name: `${i}⭐`,
    count: count,
  }));

  const COLORS = [
      'var(--ltbrand-blue)',
      'var(--ltbrand-green)',
      'var(--ltbrand-lime)',
  ];

  return (
    <>
      <WinnerResultTabs numWinners={rounds}>
        {roundIndexes.map((i) => <STARResultSummaryWidget key={i} results={results} roundIndex={i}/>)}
      </WinnerResultTabs>
      <DetailExpander title='Details'>
        <STARDetailedResults results={results} rounds={rounds}/>
        <DetailExpander title='Additional Info'>
          <WidgetContainer>
            <Widget title='Tabulation Steps'>
              <STARResultDetailedStepsWidget results={results} rounds={rounds}/>
            </Widget>
            <Widget title='Distribution of Equal Preference Votes'>
              <ResponsiveContainer width="90%" height={50*5}>
                <BarChart data={noPrefStarData} barCategoryGap={5} layout="vertical">
                    <XAxis hide axisLine={false} type="number" />
                    <YAxis
                        dataKey='name'
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{fontSize: '.9rem', fill: 'black', fontWeight: 'bold'}}
                        width={50}
                    />
                    <Bar dataKey='count' fill='#026A86' unit='votes' label={{position: 'insideLeft', fill: 'black', stroke: 'black', strokeWidth: 1}}>
                        {noPrefStarData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index) % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Widget>
          </WidgetContainer>
        </DetailExpander>
      </DetailExpander>
    </>
  );
}

function RankedRobinViewer({ results }: {results: rankedRobinResults}) {
  const [viewMatrix, setViewMatrix] = useState(false)
  return (<>
      <h2>Detailed Results</h2>
      <table className='matrix'>
        <thead className='matrix'>
          <tr>
            <th className='matrix'> Candidate</th>
            <th className='matrix'> # of wins</th>
          </tr>

          {results.summaryData.candidates.map((c, n) => (
            <>
              <tr className='matrix' key={`h${n}`} >{c.name}
                <td> {results.summaryData.totalScores[n].score} </td>
              </tr>

            </>
          ))}
        </thead>
      </table>
      <Grid container alignItems="center" >
        <Grid item xs={1}>
          {!viewMatrix &&
            <IconButton aria-label="Home" onClick={() => { setViewMatrix(true) }}>
              <ExpandMore />
            </IconButton>}
          {viewMatrix &&
            <IconButton aria-label="Home" onClick={() => { setViewMatrix(false) }}>
              <ExpandLess />
            </IconButton>}
        </Grid>
        <Grid item xs={2}>
          <h3> View Preference Matrix</h3>
        </Grid>
      </Grid>
      {viewMatrix && <MatrixViewer results={results} />}
    </>
  );
}

function IRVResultsViewer({ results }: {results: irvResults}) {
  const [viewMatrix, setViewMatrix] = useState(false)
  return (
    <div className="resultViewer">
      <h2>Detailed Results</h2>

      <Paper elevation={0} sx={{ width: '100%' }}>
        <TableContainer sx={{ maxHeight: 600, maxWidth: { xs: 300, sm: 500, md: 600, lg: 1000 } }}>
          <Table size='small' stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell
                  style={{
                    position: 'sticky',
                    left: 0,
                    background: 'white',
                    zIndex: 900,
                    minWidth: 100
                  }}
                  align='left'
                  key={``}> Candidate </TableCell>
                {results.voteCounts.map((roundVoteCounts, i) =>
                  <TableCell
                    align='right'
                    style={{
                      minWidth: 100,
                      zIndex: 800,
                    }}
                  >
                    {`Round ${i + 1}`}
                  </TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {results.summaryData.candidates.map((c, n) => (

                <TableRow >
                  <TableCell
                    align="left"
                    style={{
                      position: 'sticky',
                      left: 0,
                      background: 'white',
                      zIndex: 700,
                    }}>
                    {c.name}
                  </TableCell>
                  {results.voteCounts.map((roundVoteCounts, i) =>
                    <TableCell
                      align="right">
                      {roundVoteCounts[n]}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              <TableRow >
                <TableCell
                  align="left"
                  style={{
                    position: 'sticky',
                    left: 0,
                    background: 'white',
                    zIndex: 700,
                  }}> Exhausted Ballots</TableCell>
                {results.exhaustedVoteCounts.map((exhaustedVoteCount, i) => <TableCell align="right"> {exhaustedVoteCount} </TableCell>)}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper elevation={0} sx={{ my: 1, width: '100%' }}>
        <TableContainer sx={{ maxHeight: 600, maxWidth: { xs: 300 } }}>

          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell className='matrix'> Candidate</TableCell>
                <TableCell className='matrix'> # of wins head to head wins</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.summaryData.candidates.map((c, n) => (
                <TableRow >
                  <TableCell>
                    {c.name}
                  </TableCell>
                  <TableCell> {results.summaryData.totalScores[n].score} </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        </TableContainer>
      </Paper>
      <Grid container alignItems="center" >
        <Grid item xs={1}>
          {!viewMatrix &&
            <IconButton aria-label="Home" onClick={() => { setViewMatrix(true) }}>
              <ExpandMore />
            </IconButton>}
          {viewMatrix &&
            <IconButton aria-label="Home" onClick={() => { setViewMatrix(false) }}>
              <ExpandLess />
            </IconButton>}
        </Grid>
        <Grid item xs={2}>
          <h3> View Matrix</h3>
        </Grid>
      </Grid>
      {viewMatrix && <MatrixViewer results={results} />}
    </div>
  );
}

function PluralityResultsViewer({ results }: {results: pluralityResults}) {
  return (
    <WidgetContainer>
    <Widget title=''>
    {makeResultTable('chooseOneTable', [
      ['Candidate', 'Votes', '% All Votes'],
      ...results.summaryData.totalScores.map((totalScore, i) => [
        results.summaryData.candidates[totalScore.index].name,
        totalScore.score,
        `${Math.round(totalScore.score * 1000 / results.summaryData.nValidVotes) / 10}%`,
      ])
    ])}
    </Widget>
    </WidgetContainer>
  );
}
function ApprovalResultsViewer({ results , rounds}: {results: approvalResults, rounds: number}) {
  return (<>
    <ApprovalResultSummaryWidget results={results}/>
    <DetailExpander title='Details'>
      <DetailExpanderGroup defaultSelectedIndex={-1}>
        <GenericDetailedStepsWidget title='Detailed Steps' results={results} rounds={rounds}/>
        <div title='How Approval Voting works' style={{position: 'relative', paddingBottom: "56.25%"}}>
          <iframe style={{position: 'absolute', left: 0, width: '100%', height: '100%'}} src="https://www.youtube.com/embed/db6Syys2fmE" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
        </div>
      </DetailExpanderGroup>
    </DetailExpander>
  </>);
}

function ResultViewer({ votingMethod, results, children, learnLink=undefined }:{votingMethod: string, results:irvResults|pluralityResults|rankedRobinResults, children:any, learnLink?: string|undefined}) {
  return (
    <Box className="resultViewer">
      {children}
      <Typography component="p" sx={{textAlign: 'right', color: '#808080', fontSize: '.8rem', marginTop: '20px'}}>Voting Method: {votingMethod}
        {learnLink && <><br/><a href={learnLink} style={{color: 'inherit'}}>How {votingMethod} Works</a></>}
      </Typography>
    </Box>
  );
}

function PRResultsViewer({ result }: {result: allocatedScoreResults}) {

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
  let showTitleAsTie = ['random', '5-star'].includes(result.results.tieBreakType);
  let removeTieBreakFromTitle = election.settings.break_ties_randomly && result.results.tieBreakType == 'random';
  // quick hack for basic tie title support
  if(!showTitleAsTie && result.votingMethod === "STAR"){
    // copied from STARResultDetailedStepsWidget.tsx
    const showTieBreakerWarning = (result.results as starResults).roundResults.some(round => (round.logs.some(log => (log.includes('tiebreaker')))));
    if(showTieBreakerWarning) showTitleAsTie = true;
  }
  return (
    <div>
      <div className="flexContainer" style={{textAlign: 'center'}}>
        <Box sx={{pageBreakAfter:'avoid', pageBreakInside:'avoid'}}>
        {result.results.summaryData.nValidVotes == 0 && <h2>Still waiting for results<br/>No votes have been cast</h2>}
        {result.results.summaryData.nValidVotes >= 1 && <>
          {showTitleAsTie?
            <>
            <Typography variant="h5" sx={{fontWeight: 'bold'}}>Tied!</Typography>
            {!removeTieBreakFromTitle &&
              <Typography component="p" sx={{fontWeight: 'bold'}}>({ formatter.format(result.results.elected.map(c => c.name))} won after tie breaker)</Typography>
            }
            </>
          :
            <Typography variant="h5" sx={{fontWeight: 'bold'}}>⭐ { formatter.format(result.results.elected.map(c => c.name))} Wins! ⭐</Typography>
          }
          <Typography variant="h6">{result.results.summaryData.nValidVotes} voters</Typography>
        </>}
        </Box>
        {result.results.summaryData.nValidVotes == 1 && <p>There's only one vote so far.<br/>Full results will be displayed once there's more votes.</p> }
        {result.results.summaryData.nValidVotes > 1 &&
          <>
          {result.votingMethod === "STAR" && <ResultViewer votingMethod='Star Voting' results={result.results} learnLink='https://www.youtube.com/watch?v=3-mOeUXAkV0'>
              <STARResultViewer results={result.results} rounds={race.num_winners} />
          </ResultViewer> }

          {result.votingMethod === "Approval" && <ResultViewer votingMethod='Approval Voting' results={result.results}>
            <ApprovalResultsViewer results={result.results} rounds={race.num_winners} />
          </ResultViewer>}

          {result.votingMethod === "STAR_PR" &&
            <>
              {/* PR tabulator needs to be refactored to match interface of other methods */}
              {/* <SummaryViewer votingMethod='Proportional STAR' results={result} /> */}
              <PRResultsViewer result={result.results} />
            </>}

          {result.votingMethod === "RankedRobin" &&
            <ResultViewer votingMethod='Ranked Robin' results={result.results}>
              <RankedRobinViewer results={result.results} />
            </ResultViewer>
          }

          {result.votingMethod === "Plurality" &&
            <ResultViewer votingMethod='Plurality' results={result.results} >
              <PluralityResultsViewer results={result.results} />
            </ResultViewer>
          }


          {result.votingMethod === "IRV" &&
            <ResultViewer votingMethod='Ranked Choice Voting' results={result.results}>
              <IRVResultsViewer results={result.results} />
            </ResultViewer>
          }
        </>}
      </div>
    </div>
  );
}
