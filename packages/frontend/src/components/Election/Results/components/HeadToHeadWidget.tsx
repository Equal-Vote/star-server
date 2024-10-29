import useAnonymizedBallots from "~/components/AnonymizedBallotsContextProvider";
import useElection from "~/components/ElectionContextProvider";
import Widget from "./Widget";
import useRace from "~/components/RaceContextProvider";
import { useState } from "react";
import { Box, Divider, MenuItem, Select, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface IMatchup {
    name: string
    leftVotes: number
    rightVotes: number
}

export default ({ranked=false}) => {
    const {t} = useElection();
    const {ballotsForRace} = useAnonymizedBallots();
    const {race} = useRace();
    const [refCandidateId, setRefCandidateId] = useState(race.candidates[0].candidate_id);

    const matchups: {[key: string]:IMatchup} = {};
    race.candidates.forEach((c, i) => {
        if(c.candidate_id == refCandidateId) return;
        matchups[c.candidate_id] = {
            name: c.candidate_name,
            leftVotes: 0,
            rightVotes: 0
        }
    });

    const defValue =  (ranked)? Infinity : 0;
    ballotsForRace().forEach(scores => {
        let refValue = scores.find((score) => score.candidate_id == refCandidateId)?.score ?? defValue;
        if(ranked) refValue = -refValue; // this lets us use a max function
        scores.forEach(score => {
            if(matchups[score.candidate_id] === undefined) return;
            let value = score.score ?? defValue;
            if(ranked) value = -value; 
            if(refValue > value) matchups[score.candidate_id].leftVotes++;
            if(refValue < value) matchups[score.candidate_id].rightVotes++;
        })
    })

    let wins = 0, ties = 0, losses = 0;

    Object.values(matchups).forEach(m => {
        if(m.leftVotes > m.rightVotes) wins++;
        if(m.leftVotes == m.rightVotes) ties++;
        if(m.leftVotes < m.rightVotes) losses++;
    })

    
    return <Widget title={t('results.head_to_head_title')}>
        <Select
            value={refCandidateId}
            label={t('results.candidateSelector')}
            onChange={(e) => setRefCandidateId(e.target.value as string)}
        >
            {race.candidates.map((c, i) => <MenuItem value={c.candidate_id}>{c.candidate_name}</MenuItem>)}
        </Select>
        <Box display='flex' flexDirection='row' gap={2} flexWrap='wrap'>
            <Typography variant='h6'>{t('results.win_count', {count: wins})}</Typography>
            <Typography variant='h6'>{t('results.tie_count', {count: ties})}</Typography>
            <Typography variant='h6'>{t('results.loss_count', {count: losses})}</Typography>
        </Box>
        <Divider variant='middle' sx={{width: '100%'}}/>
    </Widget>
}