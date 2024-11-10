import useAnonymizedBallots from "~/components/AnonymizedBallotsContextProvider";
import useElection from "~/components/ElectionContextProvider";
import Widget from "./Widget";
import useRace from "~/components/RaceContextProvider";
import { useState } from "react";
import { Box, Divider, MenuItem, Paper, Select, Typography } from "@mui/material";
import { CHART_COLORS } from "~/components/util";
import { Candidate } from "@equal-vote/star-vote-shared/domain_model/Candidate";
import HeadToHeadChart from "./HeadToHeadChart";
import ResultsPieChart from "./ResultsPieChart";
import ResultsKey from "./ResultsKey";
import ResultsTable from "./ResultsTable";

// eliminationOrder is an array of candidateIds
export default ({eliminationOrderById, winnerId} : {eliminationOrderById : string[], winnerId: string}) => {
    const {t} = useElection();
    const {race, results} = useRace();
    const {ballots, ballotsForRace} = useAnonymizedBallots();


    let data = [
        { // Type 0: !hasPassedOverRanks && isWinner
            name: 'No ranks passed over, ranked winner',
            votes: 0,
            color: 'var(--ltbrand-green)'
        },
        { // Type 1: !hasPassedOverRanks && isRunnerUp && !trailingRanks
            // name: All rankings counted but disliked winner. Additional candidates after winner left blank
            name: 'All rankings counted and final rank was used for a non-winner candidate in the final round',
            votes: 0,
            color: 'var(--ltbrand-lime)'
        },
        { // Type 2: !hasPassedOverRanks && isExhausted && ranksGiven == rankLimit
            name: 'Ballot exhausted despite all rankings used',
            votes: 0,
            color: '#FFDD0080'
        },
        { // Type 3 : hasPassedOverRanks && !loserWithTrailingRanks
            name: 'Passed over rankings',
            votes: 0,
            color: 'var(--brand-red)'
        },
        { // Type 4 : !hasPassedOverRanks && loserWithTrailingRanks
            name: 'Top choice lost in final round but next choice not counted because election was called.',
            votes: 0,
            color: 'color-mix(in srgb, var(--brand-red) 50%, white)'
        },
        { // Type 5 : hasPassedOverRanks && loserWithTrailingRanks
            name: 'Passed over rankings AND lost/exhausted with trailing ranks',
            votes: 0,
            color: 'color-mix(in srgb, var(--brand-red) 50%, black)'
        },
    ]

    let b = ballotsForRace();
    let numBallots = b.length;
    b.map((scores, index) => {
        let ranksLeft = scores
            .filter(s => s.score != null)
            .sort((a, b) => a.score - b.score);

        if(ranksLeft.length == 0){
            numBallots--;
            return;
        }
        let cs = race.candidates;
        let loggedBallot = ranksLeft.map(s => ({score: s.score, name: cs.find(c => c.candidate_id == s.candidate_id).candidate_name, id: s.candidate_id}))

        let hasPassedOver = false;
        let alreadyEliminated = []

        eliminationOrderById.forEach((elimId) => {
            if(ranksLeft.length == 0) return;
            if(ranksLeft[0].candidate_id == elimId){
                ranksLeft.shift();
                while(ranksLeft.length > 0 && alreadyEliminated.includes(ranksLeft[0].candidate_id)){
                    hasPassedOver = true; 
                    ranksLeft.shift();
                }
            }
            alreadyEliminated.push(elimId);
        })

        let trailingRanks = ranksLeft.length > 1;
        let isExhausted = ranksLeft.length == 0;
        let isWinner = !isExhausted && ranksLeft[0].candidate_id == winnerId;

        // loserWithTrailingRanks = !isWinner && trailingRanks
        const ballotType = () => {
            // Type 0: !hasPassedOverRanks && isWinner
            // Type 1: !hasPassedOverRanks && !trailingRanks && isRunnerUp
            // Type 2: !hasPassedOverRanks && !trailingRanks && isExhausted
            // Type 3 : hasPassedOverRanks && !loserWithTrailingRanks
            // Type 4 : !hasPassedOverRanks && loserWithTrailingRanks
            // Type 5 : hasPassedOverRanks && loserWithTrailingRanks
            if(hasPassedOver){
                return (!isWinner && trailingRanks)? 5 : 3
            }else{
                if(isWinner){
                    return 0;
                }else{
                    if(trailingRanks){
                        return 4;
                    }else{
                        return isExhausted ? 2 : 1;
                    }
                }
            }
        }
        if(ballotType() == 2) console.log(loggedBallot);
        data[ballotType()].votes++;
    })

    return <Widget title='Voter Intent'>
        <Typography>
            Ranked Choice advocates often promise that "If your favorite doesn't win, your next choice will be counted," but that promise failed
            for {Math.round(100*(data[3].votes+data[4].votes+data[5].votes)/numBallots)}% of the voters in this election. 
        </Typography>
        <br/>
        <ResultsTable className='blah' data={[['Type', 'Votes', 'Percent'], ...data.map(d => [d.name, d.votes, `${Math.round(100*d.votes/numBallots)}%`])]}/>
        <ResultsPieChart data={data} noLegend/>
        <ResultsKey items={data.map(d => [d.color, d.name])}/>
    </Widget>
}