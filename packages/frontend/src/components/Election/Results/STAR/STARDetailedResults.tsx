import React, { useState }  from 'react'
import { TableContainer, Typography, Paper, Box} from "@mui/material";
import { roundResults, starResults, starSummaryData } from 'shared/domain_model/ITabulators';
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Widget, WidgetContainer, makeResultTable } from '~/components/util';

type candidateTableEntry = {
  name: string,
  votes: number,
  index: number,
  runoffVotes: number
}

const RUNOFF_COLORS = [
    'var(--ltbrand-blue)',
    'var(--ltbrand-green)',
    'var(--brand-gray-1)',
];

/*function RoundViewer({ summaryData, candidate, round }: {summaryData: starSummaryData, candidate: candidateTableEntry, round: roundResults }) {
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
}*/

export default ({results, rounds}: {results: starResults, rounds: number }) => {
    const winnerIndex = results.roundResults[0].winners[0].index;
    const runnerUpIndex = results.roundResults[0].runner_up[0].index;
    console.log(results);

    // NOTE: I'm only using the runoff data, but I'm still generating all the data in case I need them later
    const tableData: candidateTableEntry[] = results.summaryData.candidates.map((c, i) => ({
        name: c.name,
        votes: results.summaryData.totalScores[i].score,
        runoffVotes:
          i == winnerIndex ?
            results.summaryData.preferenceMatrix[winnerIndex][runnerUpIndex] : (
          i == runnerUpIndex ?
            results.summaryData.preferenceMatrix[runnerUpIndex][winnerIndex] : 
            0 ),
        index: i
    }));

    tableData.sort((a, b) => b.votes - a.votes);

    let runoffData = tableData.slice(0, 2);
    let finalistVotes = (runoffData[0].runoffVotes + runoffData[1].runoffVotes)
    runoffData.sort((a, b) => b.runoffVotes - a.runoffVotes);
    runoffData.push({
      name: 'Equal Preferences',
      votes: 0,
      runoffVotes: results.summaryData.nValidVotes - finalistVotes,
      index: -1,
    })

    const axisWidth = Math.min(200, 15 * 20);
    return ( <>
      <WidgetContainer>
        <Widget title="Scores Table">{
          makeResultTable('starScoreTable', [
            ['Candidate', 'Score'],
            ...tableData.map(c => [c.name, c.votes]),
          ])
        }</Widget>
      </WidgetContainer>
      <WidgetContainer>
        <Widget title='Runoff Votes'>
          <ResponsiveContainer width="90%" height={50*3}>
            <BarChart data={runoffData} barCategoryGap={5} layout="vertical">
                <XAxis hide axisLine={false} type="number" />
                <YAxis
                    dataKey='name'
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{fontSize: '.9rem', fill: 'black', fontWeight: 'bold'}}
                    width={axisWidth}
                />
                <Bar dataKey='runoffVotes' fill='#026A86' unit='votes' label={{position: 'insideLeft', fill: 'black', stroke: 'black', strokeWidth: 1}}>
                    {runoffData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={RUNOFF_COLORS[(index) % RUNOFF_COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Widget>
        <Widget title='Runoff Table'>
          {makeResultTable('starRunoffTable', [
            ['Candidate', 'Runoff Votes', '% Runoff Votes', '% Between Finalists'],
            ...runoffData.map((c, i) => [
              c.name,
              c.runoffVotes,
              `${Math.round(c.runoffVotes * 1000 / results.summaryData.nValidVotes) / 10}%`,
              i == 2 ? '' : `${Math.round(c.runoffVotes * 1000 / finalistVotes) / 10}%`,
            ]),
            ['Total', results.summaryData.nValidVotes, '100%', '100%'] 
            ])}
        </Widget>
      </WidgetContainer>
    </>);
}
