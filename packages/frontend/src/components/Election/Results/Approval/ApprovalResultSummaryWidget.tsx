import React, { useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Legend} from 'recharts';
import { Paper, Typography } from '@mui/material';
import { approvalResults } from '@equal-vote/star-vote-shared/domain_model/ITabulators';
import { CHART_COLORS } from '~/components/util';

export default ({ results }: {results: approvalResults}) => {
    const histData = results.summaryData.totalScores
        .map((candidate, i) => ({
                name: results.summaryData.candidates[candidate.index].name,
                index: candidate.index,
                votes: candidate.score,
                // vvvv HACK to get the bars to fill the whole width, this is useful if we want to test the graph padding
                votesBig: candidate.score*10000,
            })
        )

    for(let i = 0; i < results.elected.length; i++){
        histData[i].name = `⭐${histData[i].name}`
    }

    const candidateWithLongestName = results.summaryData.candidates.reduce( function(a, b){
        return (a.name.length > b.name.length)? a : b;
    })

    const axisWidth = 15 * ((candidateWithLongestName.name.length > 20)? 20 : candidateWithLongestName.name.length);
    
    return (
        <div className="resultWidget">
            <div className="graphs">
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
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[(index) % CHART_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="votingMethod">Voting Method: Approval</p>
        </div>
    );
}