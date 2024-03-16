import { Grid, Paper } from "@mui/material";
import React from "react";
import MatrixViewer from "./MatrixViewer";
import IconButton from '@mui/material/IconButton'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import Typography from '@mui/material/Typography';
import { DetailExpander, DetailExpanderGroup } from '../../util';
import STARResultSummaryWidget from "./STAR/STARResultSummaryWidget";
import STARResultTableWidget from "./STAR/STARResultTableWidget";
import STARResultDetailedStepsWidget from "./STAR/STARResultDetailedStepsWidget";
import WinnerResultTabs from "./WinnerResultTabs";
import ApprovalResultSummaryWidget from "./Approval/ApprovalResultSummaryWidget";
import { Race } from "shared/domain_model/Race";
import { ElectionResults, allocatedScoreResults, approvalResults, irvResults, pluralityResults, rankedRobinResults, starResults } from "shared/domain_model/ITabulators";
import useElection from "../../ElectionContextProvider";

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

  return (
    <div className="resultViewer">
      <WinnerResultTabs numWinners={rounds}>
        {roundIndexes.map((i) => <STARResultSummaryWidget results={results} roundIndex={i}/>)}
      </WinnerResultTabs>
      <DetailExpander title='Details'>
        <DetailExpanderGroup defaultSelectedIndex={-1}>
          <STARResultTableWidget title="Equal Preference Details" results={results} rounds={rounds}/>
          <STARResultDetailedStepsWidget title='Detailed Steps' results={results} rounds={rounds}/>
          <div title="How STAR Voting works" style={{maxWidth: '100%'}}>
            <img style={{display: 'block', width: '100%', maxWidth: '400px', margin: '0 auto 0 auto'}} src="/images/star_info_vertical.png"/>
            <hr/>
            {/*https://faq.dailymotion.com/hc/en-us/articles/360022841393-How-to-preserve-the-player-aspect-ratio-on-a-responsive-page#:~:text=In%20the%20HTML%2C%20put%20the,56.25%25%20%3D%2016%3A9.*/}
            <div style={{position: 'relative', paddingBottom: "56.25%"}}>
              <iframe style={{position: 'absolute', width: '100%', height: '100%'}} src="https://www.youtube.com/embed/3-mOeUXAkV0" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
            </div>
          </div>
        </DetailExpanderGroup>
      </DetailExpander>
    </div>
  );
}

function RankedRobinViewer({ results }: {results: rankedRobinResults}) {
  const [viewMatrix, setViewMatrix] = useState(false)
  return (
    <div className="resultViewer">
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
    </div>
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
    <div className="resultViewer">
      <h2>Detailed Results</h2>
      <table className='matrix'>
        <thead className='matrix'>
          <tr>
            <th className='matrix'> Candidate</th>
            <th className='matrix'> Votes </th>
          </tr>

          {results.summaryData.totalScores.map((totalScore, n) => (
            <>
              <tr className='matrix' key={`h${n}`} >{results.summaryData.candidates[totalScore.index].name}
                <td> {totalScore.score} </td>
              </tr>

            </>
          ))}
        </thead>
      </table>
    </div>
  );
}
function ApprovalResultsViewer({ results , rounds}: {results: approvalResults, rounds: number}) {
  return (
    <div className="resultViewer">
      <ApprovalResultSummaryWidget results={results}/>
      <DetailExpander title='Details'>
        <DetailExpanderGroup defaultSelectedIndex={-1}>
          <GenericDetailedStepsWidget title='Detailed Steps' results={results} rounds={rounds}/>
          <div title='How Approval Voting works' style={{position: 'relative', paddingBottom: "56.25%"}}>
            <iframe style={{position: 'absolute', left: 0, width: '100%', height: '100%'}} src="https://www.youtube.com/embed/db6Syys2fmE" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
          </div>
        </DetailExpanderGroup>
      </DetailExpander>
    </div>
  );
}

function SummaryViewer({ votingMethod, results }:{votingMethod: string, results:irvResults|pluralityResults|rankedRobinResults}) {
  return (
    <>
      <h2>Summary</h2>
      <p>{`Voting Method: ${votingMethod}`}</p>
      <p>{`${results.elected.length > 1 ? 'Winners' : 'Winner'}: ${results.elected.map(c => c.name).join(', ')}`}</p>
      {results.tied?.length > 0 &&
        <p>{`Tied: ${results.tied.map(c => c.name).join(', ')}`}</p>}
      <p>{`Number of voters: ${results.summaryData.nValidVotes}`}</p>
    </>
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
        {result.results.summaryData.nValidVotes == 1 && <p>There's only one vote so far.<br/>Full results will be displayed once there's more votes.</p> }
        {result.results.summaryData.nValidVotes > 1 &&
          <>
          {result.votingMethod === "STAR" && <STARResultViewer results={result.results} rounds={race.num_winners} /> }
          {result.votingMethod === "Approval" && <ApprovalResultsViewer results={result.results} rounds={race.num_winners} />}

          {result.votingMethod === "STAR_PR" &&
            <>
              {/* PR tabulator needs to be refactored to match interface of other methods */}
              {/* <SummaryViewer votingMethod='Proportional STAR' results={result} /> */}
              <PRResultsViewer result={result.results} />
            </>}

          {result.votingMethod === "RankedRobin" &&
            <>
              <SummaryViewer votingMethod='Ranked Robin' results={result.results} />
              <RankedRobinViewer results={result.results} />
            </>}

          {result.votingMethod === "Plurality" &&
            <>
              <SummaryViewer votingMethod='Plurality' results={result.results} />
              <PluralityResultsViewer results={result.results} />
            </>}


          {result.votingMethod === "IRV" &&
            <>
              <SummaryViewer votingMethod='Ranked Choice Voting' results={result.results} />
              <IRVResultsViewer results={result.results} />
            </>}
        </>}
      </div>
    </div>
  );
}
