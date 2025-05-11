import { useState } from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { starResults } from '@equal-vote/star-vote-shared/domain_model/ITabulators';

import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import STARExtraContext from './STARExtraContext';
import WidgetContainer from '../components/WidgetContainer';
import Widget from '../components/Widget';
import ResultsBarChart from '../components/ResultsBarChart';
import ResultsPieChart from '../components/ResultsPieChart';
import { getEntry } from '@equal-vote/star-vote-shared/domain_model/Util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STARResultSummaryWidget = ({ results, roundIndex, t }: {results: starResults, roundIndex: number, t: (key: string, v?: object) => any }) => {
    const [pie, setPie] = useState(false);

    // slice away candidates that won in prior rounds
    const candidates = results.summaryData.candidates.slice(roundIndex);

    const histData = candidates
        .map((c) => ({
            name: c.name,
            votes: c.score,
            // vvvv HACK to get the bars to fill the whole width, this is useful if we want to test the graph padding
            votesBig: c.score*10000 
        }))

    if(results.roundResults[roundIndex].runner_up.length == 0)
        return <Typography>{t('results.single_candidate_result', {name: histData[0].name})}</Typography>

    const pieData = candidates.slice(0, 2).map((c, i) => ({
        name: c.name,
        votes: c.votesPreferredOver[candidates[1-i].id]
    }));

    const runoffData = [...pieData]
    runoffData.push({
      name: t('results.star.equal_preferences'),
      votes: results.summaryData.nTallyVotes - pieData[0].votes - pieData[1].votes,
    })

    return (
        <Box className="resultWidget">
        <WidgetContainer>
            <Widget title={t('results.star.score_title')}>
                {(t('results.star.score_description') as Array<string>).map( (s, i) => <p key={i}>{s}</p>)}
                <ResultsBarChart
                    data={histData}
                    percentage={false} 
                    averageStars
                    percentDenominator={results.summaryData.nTallyVotes} 
                    majorityOffset
                />
            </Widget>
            <Widget title={t('results.star.runoff_title')}>
                {(t('results.star.runoff_description') as Array<string>).map( (s, i) => <p key={i}>{s}</p>)}
                {pie ? 
                    <ResultsPieChart data={pieData} star runoff/>
                :
                <>
                    <ResultsBarChart data={runoffData} stars={1} runoff percentage sortFunc={false} majorityLegend={t('results.star.runoff_majority')} />
                    <Box height={50}/> {/*HACK to get the bar chart to be the same height as the pie chart*/}
                </>
                }
                <ToggleButtonGroup
                    value={pie}
                    exclusive
                    onChange={(event, value) => setPie(value)}
                    sx={{
                        marginLeft: 'auto'
                    }}
                >
                    <ToggleButton value={false} sx={{height: 30}}>
                        <BarChartIcon sx={{transform: 'scale(.7)'}}/>
                    </ToggleButton>
                    <ToggleButton value={true} sx={{height: 30}}>
                        <PieChartIcon sx={{transform: 'scale(.7)'}}/>
                    </ToggleButton>
                </ToggleButtonGroup>
                <STARExtraContext results={results} roundIndex={roundIndex}/>
            </Widget>
        </WidgetContainer>
        </Box>
    );
}
export default STARResultSummaryWidget 
