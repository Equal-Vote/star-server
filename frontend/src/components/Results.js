import { Grid } from "@material-ui/core";
import React from "react";
import MatrixViewer from "./MatrixViewer";
import IconButton from '@material-ui/core/IconButton'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { useState } from 'react'
// import Grid from "@material-ui/core/Grid";

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

function RoundViewer({ Candidate, Round }) {
  const finalistIndex = Round.finalists.indexOf(Candidate)
  const winnerIndex = Round.winners.indexOf(Candidate)
  if (Round.votes == null || Round.votes.length == 0){
    return (
      <td>No votes</td>
    )
  }

  const totalRunoffVotes = Round.votes.reduce((a, b) => a + b)
  const runoffPercentages = Round.votes.map(vote => (`${Math.round(vote * 1000 / totalRunoffVotes) / 10}%`))

  return (
    < >
      {finalistIndex !== -1 ? <td className='highlight'> {Round.votes[finalistIndex]} </td> : <td>  </td>}
      {finalistIndex !== -1 ?
        winnerIndex !== -1 ?
          <td className='highlight'> {`${Math.round(Round.votes[finalistIndex] * 1000 / totalRunoffVotes) / 10}%`}</td>
          : <td> {`${Math.round(Round.votes[finalistIndex] * 1000 / totalRunoffVotes) / 10}%`} </td>
        : <td>  </td>}

    </>
  )

}

function ResultViewer({ title, results, rounds }) {
  const [viewMatrix, setViewMatrix] = useState(false)
  return (
    <div key={title} className="resultViewer">
      <h2>{title}</h2>
      <table className='matrix'>
        <thead className='matrix'>

          {rounds > 1 &&
            <>
              <th className='matrix'> </th>
              <th className='matrix'> </th>
              {results.rounds.map((round, r) => (
                r < rounds && <>
                  <th colspan="2"> {`Round ${r + 1}`} </th>
                </>))}
            </>
          }
          <tr>
            <th className='matrix'> Candidate</th>
            <th className='matrix'> Total Score</th>
            {results.rounds.map((round, r) => (
              r < rounds && <>
                <th className='matrix'> Runoff Votes</th>
                <th className='matrix'> % Runoff Votes</th>
              </>))}
          </tr>

          {results.candidates.map((c, n) => (
            <>
              <tr className='matrix' key={`h${n}`} >{c.name}
                <td> {c.totalScore} </td>
                {results.rounds.map((round, r) => (
                  r < rounds && <RoundViewer Candidate={n} Round={round} />))}

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

function SummaryViewer({ cvr }) {
  const candidates = cvr.candidates.length;
  const voters = cvr.voters.length;
  const underVotes = cvr.undervotes.length;
  const summaryMessage = `${candidates} candidates, ${voters} voters, ${underVotes} underVotes.`;
  const instructions =
    "STAR results for single-winner and multi-winner elections are shown below.";

  return (
    <>
      <h2>Summary</h2>
      <p>
        <b>{summaryMessage}</b>
      </p>
      {/* <p>{instructions}</p> */}
    </>
  );
}

function PRResultsViewer({ data }) {

  return (
    <div>
      <h2>Winners:</h2>
      {data.Results.pr.winners.map((winner) => <h3> {winner.name}</h3>)}
      <h2>Losers:</h2>
      {data.Results.pr.losers.map((loser) => <h3> {loser.name}</h3>)}
      <h2>Scores By Round</h2>
      <table className='matrix'>
        <thead className='matrix'>
          <tr className='matrix'>
            <th className='matrix'> Candidate</th>
            {data.Results.pr.winners.map((c, n) => (
              <th className='matrix' key={`h${n}`} >Round {n + 1} </th>
            ))}
          </tr>
        </thead>
        <tbody className='matrix'>
          {console.log(data.Results.pr.weightedSumsData)}
          {data.Results.pr.weightedSumsData.map((row, i) => (
            <tr className='matrix' key={`d${i}`}>
              <th className='matrix' key={`dh${i}`} >{data.Results.cvr.candidates[i].name}</th>
              {row.map((col, j) => (
                data.Results.pr.winners[j].index === data.Results.cvr.candidates[i].index ?
                  <td className='highlight' key={`c${i},${j}`}>
                    <h3>{Math.round(col * 10) / 10}</h3>
                  </td>
                  :
                  <td className='matrix' key={`c${i},${j}`}>
                    <h3>{Math.round(col * 10) / 10}</h3>
                  </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Results({ data }) {
  return (
    <div>
      <SummaryViewer cvr={data.Results.cvr} />
      <div className="flexContainer">
        {data.Election.races[0].voting_method === "STAR" &&
          data.Election.races[0].num_winners == 1 &&
          <ResultViewer title="Single-Winner Results" results={data.Results.single} rounds={1} />}

        {data.Election.races[0].voting_method === "STAR" &&
          data.Election.races[0].num_winners > 1 &&
          <ResultViewer title="Multi-Winner Results" results={data.Results.multi} rounds={data.Election.races[0].num_winners} />}

        {data.Election.races[0].voting_method === "STAR-PR" &&
          <PRResultsViewer data={data} />}
      </div>
    </div>
  );
}
