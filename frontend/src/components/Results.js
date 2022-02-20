import { Grid } from "@material-ui/core";
import React from "react";
import MatrixViewer from "./MatrixViewer";

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
function ResultViewer({ title, results }) {
  return (
    <div key={title} className="resultViewer">
      <h2>{title}</h2>
      {results.sections.map((section) => (
        <>
          <h3>{section.title}</h3>
          <>
            {section.candidates.length === 0 && (
              <p>
                <i>None</i>
              </p>
            )}
            {section.candidates.map((index, n) => (
              <>
                {typeof section.votes != "undefined" &&
                  <CandidateViewer key={n} candidate={results.candidates[index]} runoffScore={section.votes[n]} />}
                {typeof section.votes == "undefined" &&
                  <CandidateViewer key={n} candidate={results.candidates[index]} />}
              </>
            ))}
          </>
        </>
      ))}
      <MatrixViewer results={results} />
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

export default function Results({ data }) {
  console.log(data)
  return (
    <div>
      <SummaryViewer cvr={data.Results.cvr} />
      <div className="flexContainer">
        {data.Election.races[0].voting_method === "STAR" &&
          data.Election.races[0].num_winners == 1 &&
          <ResultViewer title="Single-Winner Results" results={data.Results.single} />}

        {data.Election.races[0].voting_method === "STAR" &&
          data.Election.races[0].num_winners > 1 &&
          <ResultViewer title="Multi-Winner Results" results={data.Results.multi} />}

        {data.Election.races[0].voting_method === "STAR-PR" &&
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
                    <th className='matrix' key={`h${n}`} >Round {n+1} </th>
                  ))}
                </tr>
              </thead>
              <tbody className='matrix'>
                {console.log(data.Results.pr.weightedSumsData)}
                {data.Results.pr.weightedSumsData.map((row, i) => (
                  <tr className='matrix' key={`d${i}`}>
                    <th className='matrix' key={`dh${i}`} >{data.Results.cvr.candidates[i].name}</th>
                    {row.map((col, j) => (
                      <td className='matrix' key={`c${i},${j}`}>
                        <h3>{Math.round(col*10)/10}</h3>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
      </div>
    </div>
  );
}
