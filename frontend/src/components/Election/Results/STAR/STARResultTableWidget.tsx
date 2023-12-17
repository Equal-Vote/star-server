import React, { useState }  from 'react'
import { TableContainer} from "@mui/material";
import { roundResults, starResults, starSummaryData } from '../../../../../../domain_model/ITabulators';

type candidateTableEntry = {
  name: string,
  votes: number,
  index: number,
}

function RoundViewer({ summaryData, candidate, round }: {summaryData: starSummaryData, candidate: candidateTableEntry, round: roundResults }) {
  const winnerIndex = round.winners[0].index
  const runnerUpIndex = round.runner_up[0].index
  const totalRunoffVotes = summaryData.nValidVotes

  var isFinalist = false
  var runoffVotes = 0
  // const isFinalist = Candidate.index===winnerIndex||Candidate.index===runnerUpIndex
  if (candidate.index === winnerIndex) {
    isFinalist = true
    runoffVotes = summaryData.preferenceMatrix[winnerIndex][runnerUpIndex]
  }
  else if (candidate.index === runnerUpIndex) {
    isFinalist = true
    runoffVotes = summaryData.preferenceMatrix[runnerUpIndex][winnerIndex]
  }
  else {
    isFinalist = false
    runoffVotes = 0
  }
  return (
    < >
      {isFinalist && <>
          <td className={`${candidate.index === winnerIndex ? 'highlight' : ''}`}>
            {runoffVotes}
          </td>
          <td className={`${candidate.index === winnerIndex ? 'highlight' : ''}`}>
             {`${Math.round(runoffVotes * 1000 / totalRunoffVotes) / 10}%`}
          </td>
        </>
      }
      { !isFinalist && <><td/><td/></> }
    </>
  )
}

const STARResultTableWidget = ({title, results, rounds}: {title: string, results: starResults, rounds: number }) => {
    const tableData: candidateTableEntry[] = results.summaryData.candidates.map((c, n) => ({
        name: c.name,
        votes: results.summaryData.totalScores[n].score,
        index: n
    }));

    tableData.sort((a, b) => b.votes - a.votes);

    return (
      <TableContainer sx={{ marginLeft: 'auto', marginRight: 'auto', maxHeight: 600, maxWidth: {xs:300, sm: 500, md: 550, lg: 550}}}>
        <table className='resultTable'>
        <thead className='resultTable'>

        {rounds > 1 &&
        <>
          <th className='resultTable'> </th>
          <th className='resultTable'> </th>
          {results.roundResults.map((round, r) => (
            r < rounds && <>
              <th colSpan={2}> {`Round ${r + 1}`} </th>
            </>))}
        </>
        }
        <tr>
        <th className='resultTable'> Candidate</th>
        <th className='resultTable'> Total Score</th>
        {results.roundResults.map((round, r) => (
          r < rounds && <>
            <th className='resultTable'> Runoff Votes</th>
            <th className='resultTable'> % Runoff Votes</th>
          </>))}
        </tr>
        </thead>

        <tbody>
        {tableData.map((c, n) => (
        <>
          <tr className='resultTable' key={`h${n}`}>
            <td className={`resultTable ${(n < 2)?'highlight':''}`} style={{paddingLeft: '8px'}}>{c.name}</td>
            <td className={`resultTable ${(n < 2)?'highlight':''}`}> {c.votes} </td>
            {results.roundResults.map((round, r) => (
              r < rounds && <RoundViewer summaryData={results.summaryData} candidate={c} round={round} />))}
          </tr>
        </>
        ))}
        </tbody>
      </table>
    </TableContainer>
    );
}

export default STARResultTableWidget;
