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

// candidates helps define the order
export default ({topScore, frontRunners=[], ranked=false} : {topScore: number, frontRunners?: Candidate[], ranked?: boolean}) => {
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

    let totalTopScored = 0;

    let defValue = (ranked)? (election.settings.max_rankings ?? parseInt(process.env.REACT_APP_DEFAULT_BALLOT_RANKS))+1 : 0

    ballotsForRace().forEach(scores => {
        let refScore = scores.find((score) => score.candidate_id == refCandidateId)?.score;
        if(refScore != topScore) return;
        totalTopScored++;
        scores.forEach(s => {
            avgBallot[s.candidate_id].score += s.score ?? defValue;
        })
    });

    let data = Object.values(avgBallot);
    data.forEach(c => c.score = Math.round(100*c.score / totalTopScored)/100);
    data.sort((a,b) => (ranked? 1 : -1)*(a.score-b.score));

    return <Widget title={t('results.voter_profile_title')}>
        <Select
            value={refCandidateId}
            label={t('results.candidateSelector')}
            onChange={(e) => setRefCandidateId(e.target.value as string)}
        >
            {candidates.map((c, i) => <MenuItem key={i} value={c.candidate_id}>{c.candidate_name}</MenuItem>)}
        </Select>
        <Divider variant='middle' sx={{width: '100%', m:3}}/>
        <ResultsBarChart data={data} xKey='score' percentage={false} sortFunc={false}/>
    </Widget>
}