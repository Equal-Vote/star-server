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

interface IMatchup {
    name: string
    leftVotes: number
    rightVotes: number,
    equalPreferences: {name: string, count: number}[]
}

// candidates helps define the order
export default ({candidates=[], ranked=false} : {candidates?: Candidate[], ranked?: boolean}) => {
    const {t} = useElection();
    const {ballots, ballotsForRace} = useAnonymizedBallots();
    const {race} = useRace();
    if(candidates.length == 0) candidates = race.candidates;
    const [refCandidateId, setRefCandidateId] = useState(candidates[0].candidate_id);

    const refCandidateName = candidates.find(c => c.candidate_id == refCandidateId).candidate_name;
    const matchups: {[key: string]:IMatchup} = {};
    candidates.forEach((c, i) => {
        if(c.candidate_id == refCandidateId) return;
        matchups[c.candidate_id] = {
            name: c.candidate_name,
            leftVotes: 0,
            rightVotes: 0,
            equalPreferences: [] 
        }
    });

    const incIndex = (arr, index) => {
        if(index < 0) return; // Quick Hack to keep the page from crashing
        while(index >= arr.length ){
            arr.push({
                name: arr.length,
                count: 0
            });
        }
        arr[index].count++;
    }

    const defValue =  (ranked)? Infinity : 0;
    let b = ballotsForRace()
    let numBallots = b.length;
    b.forEach((scores, j) => {
        let refValue = scores.find((score) => score.candidate_id == refCandidateId)?.score ?? defValue;
        if(ranked) refValue = -refValue; // this lets us use a max function
        scores.forEach(score => {
            if(matchups[score.candidate_id] === undefined) return;
            let value = score.score ?? defValue;
            if(ranked) value = -value; 
            if(refValue > value) matchups[score.candidate_id].leftVotes++;
            if(refValue < value) matchups[score.candidate_id].rightVotes++;
            // hacky infinitiy check
            if(Math.abs(value) < 1000 && refValue == value) incIndex(matchups[score.candidate_id].equalPreferences, value)
        })
    })

    let wins = 0, ties = 0, losses = 0;

    Object.values(matchups).forEach(m => {
        if(m.leftVotes > m.rightVotes) wins++;
        if(m.leftVotes == m.rightVotes) ties++;
        if(m.leftVotes < m.rightVotes) losses++;
    })

    return <Widget title={t('results_ext.head_to_head_title')} wide>
        <Select
            value={refCandidateId}
            label={t('results_ext.candidate_selector')}
            onChange={(e) => setRefCandidateId(e.target.value as string)}
        >
            {candidates.map((c, i) => <MenuItem key={i} value={c.candidate_id}>{c.candidate_name}</MenuItem>)}
        </Select>
        <Divider variant='middle' sx={{width: '100%', m: 3}}/>
        <Typography variant='h6'>{refCandidateName} won {wins} matchups, and lost {losses}.</Typography>
        <Box display='flex' flexDirection='column' gap={4} sx={{my: 3, width: '100%', overflowY: {xs: 'unset', md: 'scroll'}, maxHeight: {xs: 'unset', md: '750px'}}}>
            {candidates.filter(c => c.candidate_id != refCandidateId).map((c,i) => {
                let m = matchups[c.candidate_id];
                return <HeadToHeadChart
                    key={i}
                    leftName={refCandidateName} rightName={m.name}
                    leftVotes={m.leftVotes} rightVotes={m.rightVotes}
                    total={numBallots}
                    equalContent={
                        (race.voting_method == 'IRV' || race.voting_method == 'STV')?
                        {
                            title: 'No Preferences',
                            description: `These voters didn't rank either candidate`
                        }
                        :
                        {
                            title: 'Distribution of Equal Support',
                            description: m.equalPreferences
                        }
                    }
                />
            })}
        </Box>
        <ResultsKey items={[
            [CHART_COLORS[0], `${refCandidateName}'s support`],
            ['var(--brand-gray-1)', ranked ? "Didn't rank either" : "Didn't score either"],
            [CHART_COLORS[1], `Other candidate's support`],
        ]} />
    </Widget>
}