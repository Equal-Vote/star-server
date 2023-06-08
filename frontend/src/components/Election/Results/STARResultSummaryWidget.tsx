import React, { useEffect } from 'react'
import StarRoundedIcon from '@mui/icons-material/Star';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import { BarChart, Bar, PieChart, Pie, Cell, LabelList, XAxis, YAxis} from 'recharts';
import { Divider, Paper } from '@mui/material';
import { callbackify } from 'util';

// NOTE: I tried using brand.gold here, but it didn't work
const COLORS = [
    'var(--brand-gold)',
    'var(--brand-blue)',
    'var(--brand-orange)',
    'var(--brand-purple)',
    'var(--brand-green)',
    'var(--brand-red)',
    'var(--brand-ltblue)',
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
        votesBig: results.summaryData.totalScores[n].score*10000 // HACK to get the bars to fill the whole width
    }));

    const winnerIndex = results.roundResults[0].winners[0].index;
    const runnerUpIndex = results.roundResults[0].runner_up[0].index;
    const winnerVotes = results.summaryData.preferenceMatrix[winnerIndex][runnerUpIndex];
    const runnerUpVotes = results.summaryData.preferenceMatrix[runnerUpIndex][winnerIndex];
    const noPrefVotes = results.summaryData.nValidVotes - winnerVotes - runnerUpVotes;

    var pieColors = [
        'var(--brand-gold)',
        'var(--brand-gray-2)',
        'var(--brand-blue)',
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
                <Paper className='graph' sx={{position: 'relative', backgroundColor: 'brand.gray1', left: '80px', borderRadius: '10px'}}>
                    <h3>Score Round</h3>
                    <p>Add the Stars across all ballots</p>  
                    <p>The two highest scoring candidates are the finalists</p>
                    <BarChart width={500} height={50*histData.length} data={histData} barCategoryGap={5} layout="vertical">
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
                                //stroke='white' strokeWidth={(index < 2)? 4 : 0}
                            ))}
                        </Bar>
                    </BarChart>
                    {
                        //<div style={{width: 'calc(100% + 20px)', height: '3px', backgroundColor: 'var(--brand-gray-2)', margin: '40px 0px' }}/>
                    }
                    <div style={{height: '3px', backgroundColor: 'var(--brand-gray-1)', margin: '30px 0px' }}/>
                </Paper>
                <Paper className='graph' sx={{boxShadow: 15, position: 'relative', top: '-50px', left: '30px', backgroundColor: 'brand.gray1', borderRadius: '10px'}}>
                    <h3>Automatic Runoff Round</h3>
                    <p>Each vote goes to their prefferred candidate</p>
                    <p>The candidate with most votes wins </p>
                    <PieChart width={600} height={250}>
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
                                <Cell key={`cell-${index}`} fill={ pieColors[index]} stroke='var(--brand-gray-1)' strokeWidth={6}/>
                            ))}
                        </Pie>
                    </PieChart>
                </Paper>
            </div>
            <p className="votingMethod">Voting Method: STAR</p>
        </div>
    );
}
export default STARResultSummaryWidget 