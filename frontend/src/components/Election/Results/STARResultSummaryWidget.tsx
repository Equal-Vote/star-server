import React, { useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Legend} from 'recharts';
import { Paper, Typography } from '@mui/material';

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

const STARResultSummaryWidget = ({ results, roundIndex }) => {
    const prevWinners = results.roundResults
        .filter((_, i) => i < roundIndex)
        .map(round => round.winners)
        .flat(1)
        .map(winner => winner.index);

    const histData = results.summaryData.candidates
        .filter((_, i) => !prevWinners.includes(i))
        .map((c, n) => ({
            name: c.name,
            votes: results.summaryData.totalScores[n].score,
            // vvvv HACK to get the bars to fill the whole width, this is useful if we want to test the graph padding
            votesBig: results.summaryData.totalScores[n].score*10000 
        }));

    histData.sort((a, b) => b.votes - a.votes);

    for(let i = 0; i < 2; i++){
        histData[i].name = `⭐${histData[i].name}`
    }

    const winnerIndex = results.roundResults[roundIndex].winners[0].index;
    const runnerUpIndex = results.roundResults[roundIndex].runner_up[0].index;
    const winnerVotes = results.summaryData.preferenceMatrix[winnerIndex][runnerUpIndex];
    const runnerUpVotes = results.summaryData.preferenceMatrix[runnerUpIndex][winnerIndex];
    const noPrefVotes = results.summaryData.nValidVotes - winnerVotes - runnerUpVotes;

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
        {
            name: 'No Preference',
            votes: noPrefVotes
        },
    ];

    if(noPrefVotes == 0){
        pieColors.splice(2, 1);
        pieData.splice(2, 1);
    }

    const candidateWithLongestName = results.summaryData.candidates.reduce( function(a, b){
        return (a.name.length > b.name.length)? a : b;
    })

    const axisWidth = 15 * ((candidateWithLongestName.name.length > 20)? 20 : candidateWithLongestName.name.length);
    
    const pieAngle = 90 + 360 * (1 - (pieData[0].votes/results.summaryData.nValidVotes))

    return (
        <div className="resultWidget">
            <div className="graphs">
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
            </div>
            <p className="votingMethod">Voting Method: STAR</p>
        </div>
    );
}
export default STARResultSummaryWidget 