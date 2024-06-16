import React, { useEffect } from 'react'
import { Box, Paper, Typography } from '@mui/material';
import { starResults } from '@equal-vote/star-vote-shared/domain_model/ITabulators';
import { ResultsPieChart, Widget, WidgetContainer } from '~/components/util';
import { ResultsBarChart } from '~/components/util';
import { useTranslation } from 'react-i18next';

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


    var pieData = [
        {
            name: results.summaryData.candidates[winnerIndex].name,
            votes: winnerVotes
        },
        {
            name: results.summaryData.candidates[runnerUpIndex].name,
            votes: runnerUpVotes
        },
    ];

    const {t} = useTranslation();

    return (
        <Box className="resultWidget">
        <WidgetContainer>
            <Widget title={t('results.star.score_title')}>
                {(t('results.star.score_description', {returnObjects: true}) as Array<String>).map( (s, i) => <p key={i}>{s}</p>)}
                <ResultsBarChart
                    data={histData}
                    sortFunc={(a, b) => {
                        if(a.index == winnerIndex) return -1;
                        if(b.index == winnerIndex) return 1;
                        if(a.index == runnerUpIndex) return -1;
                        if(b.index == runnerUpIndex) return 1;
                        return b.votes - a.votes;
                    }}
                    percentage={false} 
                    percentDenominator={results.summaryData.nValidVotes*5} 
                />
            </Widget>
            <Widget title='Automatic Runoff Round'>
                {(t('results.star.runoff_description', {returnObjects: true}) as Array<String>).map( (s, i) => <p key={i}>{s}</p>)}
                <ResultsPieChart data={pieData} star/>
            </Widget>
        </WidgetContainer>
        </Box>
    );
}
export default STARResultSummaryWidget 
