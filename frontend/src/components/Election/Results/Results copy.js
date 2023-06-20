import { Grid, Paper } from "@mui/material";
import React from "react";
import MatrixViewer from "./MatrixViewer";
import IconButton from '@mui/material/IconButton'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
// import Grid from "@mui/material/Grid";

function CandidateViewer({ candidate, runoffScore }) {
  return (
    <>
      {typeof runoffScore != "undefined" &&
        <p>
          <b>{candidate.name}</b>: Total Score: {candidate.totalScore}, Runoff Votes: {runoffScore}
        </p>
      }
      {typeof runoffScore == "undefined" &&
        <p>
          <b>{candidate.name}</b>: Total Score: {candidate.totalScore}
        </p>
      }
    </>
  );
}

function RoundViewer({ summaryData, Candidate, Round }) {
  const winnerIndex = Round.winners[0].index
  const runnerUpIndex = Round.runner_up[0].index
  const totalRunoffVotes = summaryData.nValidVotes

  var isFinalist = false
  var runoffVotes = 0
  // const isFinalist = Candidate.index===winnerIndex||Candidate.index===runnerUpIndex
  if (Candidate.index === winnerIndex) {
    isFinalist = true
    runoffVotes = summaryData.preferenceMatrix[winnerIndex][runnerUpIndex]
  }
  else if (Candidate.index === runnerUpIndex) {
    isFinalist = true
    runoffVotes = summaryData.preferenceMatrix[runnerUpIndex][winnerIndex]
  }
  else {
    isFinalist = false
    runoffVotes = 0
  }
  return (
    < >
      {isFinalist && <td className='highlight'> {runoffVotes} </td>}
      {!isFinalist && <td>  </td>}
      {isFinalist && Candidate.index === winnerIndex &&
          <td className='highlight'> {`${Math.round(runoffVotes * 1000 / totalRunoffVotes) / 10}%`}</td>}
      {isFinalist && Candidate.index !== winnerIndex &&
          <td> {`${Math.round(runoffVotes * 1000 / totalRunoffVotes) / 10}%`} </td>}
      {!isFinalist && Candidate.index === winnerIndex &&
         <td>  </td>}

    </>
  )

}

function STARResultViewer({ results, rounds }) {
  const [viewDetails, setViewDetails] = useState(false)
  const [viewMatrix, setViewMatrix] = useState(false)
  const [viewHist, setViewHist] = useState(false)
  return (
    <div className="resultViewer">
      <Grid container alignItems="center" >
        <Grid item xs={11}>
          <h2>Detailed Results</h2>
        </Grid>
        <Grid item xs={1}>
          {!viewDetails &&
            <IconButton aria-label="Home" onClick={() => { setViewDetails(true) }}>
              <ExpandMore />
            </IconButton>}
          {viewDetails &&
            <IconButton aria-label="Home" onClick={() => { setViewDetails(false) }}>
              <ExpandLess />
            </IconButton>}
        </Grid>
      </Grid>
      {viewDetails &&
        <>
          <table className='matrix'>
            <thead className='matrix'>

              {rounds > 1 &&
                <>
                  <th className='matrix'> </th>
                  <th className='matrix'> </th>
                  {results.roundResults.map((round, r) => (
                    r < rounds && <>
                      <th colspan="2"> {`Round ${r + 1}`} </th>
                    </>))}
                </>
              }
              <tr>
                <th className='matrix'> Candidate</th>
                <th className='matrix'> Total Score</th>
                {results.roundResults.map((round, r) => (
                  r < rounds && <>
                    <th className='matrix'> Runoff Votes</th>
                    <th className='matrix'> % Runoff Votes</th>
                  </>))}
              </tr>

              {results.summaryData.candidates.map((c, n) => (
                <>
                  <tr className='matrix' key={`h${n}`} >{c.name}
                    <td> {results.summaryData.totalScores[n].score} </td>
                    {results.roundResults.map((round, r) => (
                      r < rounds && <RoundViewer summaryData={results.summaryData} Candidate={c} Round={round} />))}

                  </tr>

                </>
              ))}
            </thead>
          </table>

          <table className='matrix'>
            <thead className='matrix'>
              <tr className='matrix'>
                Number of Valid Votes
                <td className='matrix'> {results.summaryData.nValidVotes}</td>
              </tr>
              <tr className='matrix'>
                Number of Invalid Votes
                <td className='matrix'> {results.summaryData.nInvalidVotes}</td>
              </tr>
              <tr className='matrix'>
                Number of Bullet Votes
                <td className='matrix'> {results.summaryData.nBulletVotes}</td>
              </tr>
              <tr className='matrix'>
                Number of Under Votes
                <td className='matrix'> {results.summaryData.nUnderVotes}</td>
              </tr>

            </thead>
          </table>

          <Grid container alignItems="center" >
            <Grid item xs={11}>
              <h3> View Matrix</h3>
            </Grid>
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
          </Grid>
          {viewMatrix && <MatrixViewer results={results} />}
          <h3>Additional Election Data</h3>
          {results.roundResults.map((round, r) => (
            <>
              {rounds > 1 && <h4>{`Winner ${r + 1}`}</h4>}
              {round.logs.map(log => (<p>{log}</p>))}
            </>
          ))}
        </>}
    </div>
  );
}

function RankedRobinViewer({ results }) {
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
          <h3> View Matrix</h3>
        </Grid>
      </Grid>
      {viewMatrix && <MatrixViewer results={results} />}
    </div>
  );
}

function IRVResultsViewer({ results }) {
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

function PluralityResultsViewer({ results }) {
  return (
    <div className="resultViewer">
      <h2>Detailed Results</h2>
      <table className='matrix'>
        <thead className='matrix'>
          <tr>
            <th className='matrix'> Candidate</th>
            <th className='matrix'> Votes </th>
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
    </div>
  );
}
function ApprovalResultsViewer({ results }) {
  return (
    <div className="resultViewer">
      <h2>Detailed Results</h2>
      <table className='matrix'>
        <thead className='matrix'>
          <tr>
            <th className='matrix'> Candidate</th>
            <th className='matrix'> Votes </th>
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
    </div>
  );
}

function SummaryViewer({ votingMethod, results, }) {
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

function PRResultsViewer({ result }) {

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

export default function Results({ race, result }) {
  console.log(result)
  return (
    <div>
      <div className="flexContainer">
        {race.voting_method === "STAR" &&
          race.num_winners == 1 &&
          <>
            <SummaryViewer votingMethod='STAR Voting' results={result} />
            <STARResultViewer results={result} rounds={1} />
          </>}

        {race.voting_method === "STAR" && race.num_winners > 1 &&
          <>
            <SummaryViewer votingMethod='Multi-Winner STAR Voting' results={result} />
            <STARResultViewer results={result} rounds={race.num_winners} />
          </>}

        {race.voting_method === "STAR_PR" &&
          <>
            {/* PR tabulator needs to be refactored to match interface of other methods */}
            {/* <SummaryViewer votingMethod='Proportional STAR' results={result} /> */}
            <PRResultsViewer result={result} />
          </>}

        {race.voting_method === "RankedRobin" &&
          <>
            <SummaryViewer votingMethod='Ranked Robin' results={result} />
            <RankedRobinViewer results={result} />
          </>}

        {race.voting_method === "Plurality" &&
          <>
            <SummaryViewer votingMethod='Plurality' results={result} />
            <PluralityResultsViewer results={result} />
          </>}

        {race.voting_method === "Approval" &&
          <>
            <SummaryViewer votingMethod='Approval' results={result} />
            <ApprovalResultsViewer results={result} />
          </>}

        {race.voting_method === "IRV" &&
          <>
            <SummaryViewer votingMethod='Ranked Choice Voting' results={result} />
            <IRVResultsViewer results={result} />
          </>}
      </div>
    </div>
  );
}
