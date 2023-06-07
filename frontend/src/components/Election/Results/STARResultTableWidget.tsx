import React, { useState }  from 'react'

function RoundViewer({ summaryData, candidate, round }) {
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
      {isFinalist ? <td className='highlight'> {runoffVotes} </td> : <td>  </td>}
      {isFinalist ?
        candidate.index === winnerIndex ?
          <td className='highlight'> {`${Math.round(runoffVotes * 1000 / totalRunoffVotes) / 10}%`}</td>
          : <td> {`${Math.round(runoffVotes * 1000 / totalRunoffVotes) / 10}%`} </td>
        : <td>  </td>}

    </>
  )
}

const STARResultTableWidget = ({title, results, rounds}) => {
    return <table className='matrix'>
        <thead className='matrix'>

        {rounds > 1 &&
        <>
          <th className='matrix'> </th>
          <th className='matrix'> </th>
          {results.roundResults.map((round, r) => (
            r < rounds && <>
              <th colSpan={2}> {`Round ${r + 1}`} </th>
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
              r < rounds && <RoundViewer summaryData={results.summaryData} candidate={c} round={round} />))}
          </tr>

        </>
        ))}
        </thead>
    </table>
}

export default STARResultTableWidget;
