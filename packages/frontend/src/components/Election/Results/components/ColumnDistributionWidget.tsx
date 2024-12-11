import useAnonymizedBallots from "~/components/AnonymizedBallotsContextProvider";
import useElection from "~/components/ElectionContextProvider";
import Widget from "./Widget";
import useRace from "~/components/RaceContextProvider";
import { useState } from "react";
import { Box, Divider, MenuItem, Paper, Select, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS } from "~/components/util";
import { Candidate } from "@equal-vote/star-vote-shared/domain_model/Candidate";
import HeadToHeadChart from "./HeadToHeadChart";
import ResultsKey from "./ResultsKey";
import ResultsBarChart from "./ResultsBarChart";

// candidates helps define the order
export default ({ranked=false} : {ranked?: boolean}) => {
    const {t} = useElection();
    const {ballots, ballotsForRace} = useAnonymizedBallots();
    const {race} = useRace();

    // How many columns were used?
    // Which columns were used?

    let numColumns = [];
    let whichColumns = [];
    let totalColumns = 0;

    const incIndex = (arr, key) => {
        let index = (arr == numColumns) ? key-1 : key;
        while(index >= arr.length ){
            arr.push({
                name: (arr == numColumns)? arr.length + 1 : arr.length,
                count: 0
            });
        }
        arr[index].count++;
    }

    let b = ballotsForRace()
    b.forEach((scores, j) => {
        [...new Set(scores.map(score => score.score ?? 0))].forEach(score => incIndex(whichColumns, score));

        let definedScores = scores.filter(score => score.score !== undefined && score.score !== null);
        totalColumns += definedScores.length;
        incIndex(numColumns, definedScores.length);
    })

    whichColumns = whichColumns.map(c => ({...c, name: c.name == 'blank'? 'blank' : `${c.name}⭐`}))

    return <Widget title={t(`results.column_distribution_title_${ranked? 'ranked' : 'scored'}`)}>
        <Typography variant='h6'>{t(`results.column_distribution_num_avg_${ranked? 'ranked' : 'scored'}`, {count: Math.round(100*totalColumns / b.length)/100})}</Typography>
        <Divider/>
        <Typography variant='h6'>{t(`results.column_distribution_num_title_${ranked? 'ranked' : 'scored'}`)}</Typography>
        <ResultsBarChart data={numColumns} xKey='count' percentage={true} sortFunc={false}/>
        <Divider/>
        {!ranked && <>
            <Typography variant='h6'>{t('results.column_distribution_which_title')}</Typography>
            <ResultsBarChart data={whichColumns} xKey='count' percentage={true} sortFunc={false} percentDenominator={b.length}/>
        </>}
    </Widget>
}