import React, { useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Legend} from 'recharts';
import { Box, Paper, Typography } from '@mui/material';
import { starResults } from '@equal-vote/star-vote-shared/domain_model/ITabulators';
import { CHART_COLORS, ResultsPieChart, Widget, WidgetContainer } from '~/components/util';
import { ResultsBarChart } from '~/components/util';

const STARResultSummaryWidget = ({ results, roundIndex }: {results: starResults, roundIndex: number }) => {
    const prevWinners = results.roundResults
        .filter((_, i) => i < roundIndex)
        .map(round => round.winners)
        .flat(1)
        .map(winner => winner.index);

    const histData = results.summaryData.candidates
        .map((c, i) => ({
            name: c.name,
            index: i,
            votes: results.summaryData.totalScores[i].score,
            // vvvv HACK to get the bars to fill the whole width, this is useful if we want to test the graph padding
            votesBig: results.summaryData.totalScores[i].score*10000 
        }))
        .filter((_, i) => !prevWinners.includes(i));

    const winnerIndex = results.roundResults[roundIndex].winners[0].index;
    const runnerUpIndex = results.roundResults[roundIndex].runner_up[0].index;
    const winnerVotes = results.summaryData.preferenceMatrix[winnerIndex][runnerUpIndex];
    const runnerUpVotes = results.summaryData.preferenceMatrix[runnerUpIndex][winnerIndex];

    for(let i = 0; i < 2; i++){
        histData[i].name = `⭐${histData[i].name}`
    }

    var pieData = [
        {
            name: `⭐${results.summaryData.candidates[winnerIndex].name}`,
            votes: winnerVotes
        },
        {
            name: results.summaryData.candidates[runnerUpIndex].name,
            votes: runnerUpVotes
        },
    ];

    return (
        <Box className="resultWidget">
        <WidgetContainer>
            <Widget title='Scoring Round'>
                <p>Add the stars from all the ballots.</p>  
                <p>The two highest scoring candidates are the finalists.</p>
                <ResultsBarChart
                    data={histData}
                    sortFunc={(a, b) => {
                        if(a.index == winnerIndex) return -1;
                        if(b.index == winnerIndex) return 1;
                        if(a.index == runnerUpIndex) return -1;
                        if(b.index == runnerUpIndex) return 1;
                        return b.votes - a.votes;
                    }}
                    displayPercent={false} 
                    percentDenominator={results.summaryData.nValidVotes*5} 
                />
            </Widget>
            <Widget title='Automatic Runoff Round'>
                <p>Each vote goes to the voter's preferred finalist.</p>
                <p>Finalist with most votes wins.</p>
                <ResultsPieChart data={pieData}/>
            </Widget>
        </WidgetContainer>
        </Box>
    );
}
export default STARResultSummaryWidget 
