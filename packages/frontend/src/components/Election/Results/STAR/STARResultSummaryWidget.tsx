import React, { useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Legend} from 'recharts';
import { Box, Paper, Typography } from '@mui/material';
import { starResults } from 'shared/domain_model/ITabulators';

// NOTE: I tried using brand.gold here, but it didn't work
const COLORS = [
    'var(--ltbrand-blue)',
    'var(--ltbrand-green)',
    'var(--ltbrand-lime)',
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="black" style={{fontWeight: 'bold', textAlign: 'center'}} textAnchor='middle' dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

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
    //const noPrefVotes = results.summaryData.nValidVotes - winnerVotes - runnerUpVotes;

    histData.sort((a, b) => {
        if(a.index == winnerIndex) return -1;
        if(b.index == winnerIndex) return 1;
        if(a.index == runnerUpIndex) return -1;
        if(b.index == runnerUpIndex) return 1;
        return b.votes - a.votes;
    });

    for(let i = 0; i < 2; i++){
        histData[i].name = `⭐${histData[i].name}`
    }

    var pieColors = [
        COLORS[roundIndex % COLORS.length],
        COLORS[(roundIndex+1) % COLORS.length],
        'var(--brand-gray-2)',
    ];

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

    const candidateWithLongestName = results.summaryData.candidates.reduce( function(a, b){
        return (a.name.length > b.name.length)? a : b;
    })

    // 200 is about the max width I'd want for a small mobile device, still looking for a better solution though
    const axisWidth = Math.min(200, 15 * ((candidateWithLongestName.name.length > 20)? 20 : candidateWithLongestName.name.length));
    
    const pieAngle = 90;//90 + 360 * (1 - (pieData[0].votes/results.summaryData.nValidVotes))

    return (
        <Box className="resultWidget">
        <Box className="graphs ">
            <Paper elevation={5} className='graph' sx={{backgroundColor: 'brand.white', borderRadius: '10px'}}>
                <Typography variant="h5">Scoring Round</Typography>
                <p>Add the stars from all the ballots.</p>  
                <p>The two highest scoring candidates are the finalists.</p>
                <ResponsiveContainer width="90%" height={50*histData.length}>
                    <BarChart data={histData} barCategoryGap={5} layout="vertical">
                        <XAxis hide axisLine={false} type="number" />
                        <YAxis
                            dataKey='name'
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{fontSize: '.9rem', fill: 'black', fontWeight: 'bold'}}
                            width={axisWidth}
                        />
                        <Bar dataKey='votes' fill='#026A86' unit='votes' label={{position: 'insideLeft', fill: 'black', stroke: 'black', strokeWidth: 1}}>
                            {histData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[(index+roundIndex) % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Paper>
            <Paper elevation={5} className='graph' sx={{backgroundColor: 'brand.white', borderRadius: '10px'}}>
                <Typography variant="h5">Automatic Runoff Round</Typography>
                <p>Each vote goes to the voter's preferred finalist.</p>
                <p>Finalist with most votes wins.</p>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="votes"
                            startAngle={pieAngle}
                            endAngle={pieAngle+360}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={ pieColors[index]} stroke='var(--brand-white)' strokeWidth={6}/>
                            ))}
                        </Pie>
                        <Legend 
                            layout="vertical" verticalAlign="top" align="right" 
                            formatter={(value) => <span style={{color: 'black', fontWeight: 'bold', fontSize: '.9rem'}}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Paper>
        </Box>
        </Box>
    );
}
export default STARResultSummaryWidget 