import useAnonymizedBallots from "~/components/AnonymizedBallotsContextProvider";
import useElection from "~/components/ElectionContextProvider";
import Widget from "./Widget";
import useRace from "~/components/RaceContextProvider";
import { useState } from "react";
import { Box, Divider, MenuItem, Select, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS } from "~/components/util";
import { Candidate } from "@equal-vote/star-vote-shared/domain_model/Candidate";
import ResultsBarChart from "./ResultsBarChart";
import HeadToHeadChart from "./HeadToHeadChart";

// candidates helps define the order
export default ({topScore, frontRunners, ranked=false} : {topScore: number, frontRunners: [Candidate,Candidate], ranked?: boolean}) => {
    const {t, election} = useElection();
    const {ballotsForRace} = useAnonymizedBallots();
    const {race} = useRace();
    let candidates = race.candidates;
    const [refCandidateId, setRefCandidateId] = useState(candidates[0].candidate_id);

    const avgBallot: {[key: string]:{name, score}} = {};
    candidates.forEach((c, i) => {
        avgBallot[c.candidate_id] = {
            name: c.candidate_name,
            score: 0,
        }
    });

    let refCandidateName = candidates.find(c => c.candidate_id == refCandidateId).candidate_name;

    let totalTopScored = 0;

    let b = ballotsForRace()
    let leftVotes = 0;
    let rightVotes = 0;
    let total = 0;
    b.forEach(scores => {
        let refScore = scores.find((score) => score.candidate_id == refCandidateId)?.score;
        if(refScore != topScore) return;
        totalTopScored++;
        let fScores = [0, 0];

        let defValue = 0;
        if(ranked){
            defValue = Math.max(...scores.map(s => s.score ?? 0))+1;
        }else{
            defValue = 0;
        }
        scores.forEach(s => {
            let score = s.score ?? defValue;
            avgBallot[s.candidate_id].score += score;
            frontRunners.forEach((f, i) => {
                if(s.candidate_id == f.candidate_id) fScores[i] = score;
            })
        })

        if(ranked) fScores = fScores.map(s => -s);

        if(fScores[0] > fScores[1]) leftVotes++;
        if(fScores[0] < fScores[1]) rightVotes++;
        total++;
    });

    let data = Object.values(avgBallot);
    data.forEach(c => c.score = Math.round(100*c.score / totalTopScored)/100);
    data.sort((a,b) => (ranked? 1 : -1)*(a.score-b.score));

    return <Widget title={t('results.voter_profile_title')}>
        {/*<Typography>Average ballot for voters who gave</Typography>*/}
        <Select
            value={refCandidateId}
            label={t('results.candidateSelector')}
            onChange={(e) => setRefCandidateId(e.target.value as string)}
        >
            {candidates.map((c, i) => <MenuItem key={i} value={c.candidate_id}>{c.candidate_name}</MenuItem>)}
        </Select>
        {/*<Typography>their maximum support</Typography>*/}
        <Divider variant='middle' sx={{width: '100%', m:3}}/>
        <Typography variant='h6'>{refCandidateName} supporters' preferred frontrunner:</Typography>
        <HeadToHeadChart 
            leftName={frontRunners[0].candidate_name}
            rightName={frontRunners[1].candidate_name}
            leftVotes={leftVotes}
            rightVotes={rightVotes}
            total={total}
        />
        <Divider variant='middle' sx={{width: '100%', m:3}}/>
        <Typography variant='h6'>{refCandidateName} supporters' average rankings:</Typography>
        <ResultsBarChart data={data} xKey='score' percentage={false} sortFunc={false}/>
    </Widget>
}