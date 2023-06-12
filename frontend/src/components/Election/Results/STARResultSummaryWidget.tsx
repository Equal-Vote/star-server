import React, { useEffect } from 'react'
import StarRoundedIcon from '@mui/icons-material/Star';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import { BarChart, Bar, PieChart, Pie, Cell, LabelList, XAxis, YAxis, ResponsiveContainer} from 'recharts';
import { Divider, Paper, Typography } from '@mui/material';
import { callbackify } from 'util';

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
        <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const STARResultSummaryWidget = ({ results, rounds }) => {
    const histData = results.summaryData.candidates.map((c, n) => ({
        name: (n < 2)? `⭐${c.name}` : c.name,
        votes: results.summaryData.totalScores[n].score,
        // vvvv HACK to get the bars to fill the whole width, this is useful if we want to test the graph padding
        votesBig: results.summaryData.totalScores[n].score*10000 
    }));

    const winnerIndex = results.roundResults[0].winners[0].index;
    const runnerUpIndex = results.roundResults[0].runner_up[0].index;
    const winnerVotes = results.summaryData.preferenceMatrix[winnerIndex][runnerUpIndex];
    const runnerUpVotes = results.summaryData.preferenceMatrix[runnerUpIndex][winnerIndex];
    const noPrefVotes = results.summaryData.nValidVotes - winnerVotes - runnerUpVotes;

    var pieColors = [
        'var(--ltbrand-blue)',
        'var(--brand-gray-2)',
        'var(--ltbrand-green)',
    ];

    var pieData = [
        {
            name: `⭐${results.summaryData.candidates[winnerIndex].name}`,
            votes: winnerVotes
        },
        {
            name: 'No Preference',
            votes: noPrefVotes
        },
        {
            name: results.summaryData.candidates[runnerUpIndex].name,
            votes: winnerVotes
        }
    ];

    if(noPrefVotes == 0){
        pieColors.splice(1, 1);
        pieData.splice(1, 1);
    }

    const candidateWithLongestName = results.summaryData.candidates.reduce( function(a, b){
        return (a.name.length > b.name.length)? a : b;
    })

    const axisWidth = 10 * ((candidateWithLongestName.name.length > 20)? 20 : candidateWithLongestName.name.length);
    
    return (
        <div className="resultWidget">
            <h2>🎉 {results.elected.map(c => c.name).join(', ')} Wins! 🎉</h2>
            <div className="graphs">
                <Paper elevation={5} className='graph' sx={{backgroundColor: 'brand.white', borderRadius: '10px'}}>
                    <Typography variant="h3">Scoring Round</Typography>
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
                               label={{fill: 'black', stroke: 'black', strokeWidth: 1}}
                               width={axisWidth}
                           />
                           <Bar dataKey='votes' fill='#026A86' unit='votes' label={{position: 'insideLeft', fill: 'black', stroke: 'black', strokeWidth: 1}}>
                               {histData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                               ))}
                           </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                    {
                        //<div style={{width: 'calc(100% + 20px)', height: '3px', backgroundColor: 'var(--brand-gray-2)', margin: '40px 0px' }}/>
                    }
                    <div style={{height: '3px', backgroundColor: 'var(--brand-gray-1)', margin: '30px 0px' }}/>
                </Paper>
                <Paper elevation={5} className='graph' sx={{backgroundColor: 'brand.white', borderRadius: '10px'}}>
                    <h3>Automatic Runoff Round</h3>
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
                                startAngle={90}
                                endAngle={450}
                            >
                                <LabelList dataKey='name' position='outside' fill='unset' strokeWidth={0}/>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={ pieColors[index]} stroke='var(--brand-white)' strokeWidth={6}/>
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </Paper>
            </div>
            <p className="votingMethod">Voting Method: STAR</p>
        </div>
    );
}
export default STARResultSummaryWidget 