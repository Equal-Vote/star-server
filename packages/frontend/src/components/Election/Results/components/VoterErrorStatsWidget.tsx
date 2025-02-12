import { irvResults } from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import useAnonymizedBallots from "~/components/AnonymizedBallotsContextProvider";
import useElection from "~/components/ElectionContextProvider";
import useRace from "~/components/RaceContextProvider";
import Widget from "./Widget";
import { Box, Typography } from "@mui/material";
import RectPieChart from "./RectPieChart";
import ResultsBarChart from "./ResultsBarChart";

export default () => {
    const {t} = useElection();
    const {ballots, ballotsForRaceWithMeta} = useAnonymizedBallots();
    let {results, race} = useRace();
    results = results as irvResults

    const totalVotes = results.summaryData.nAbstentions + results.summaryData.nTallyVotes;

    const abstentionData = [
        {name: 'Tallied Votes', value: results.summaryData.nTallyVotes},
        {name: 'Abstentions', value: results.summaryData.nAbstentions},
    ];

    let totalSkippedVotes = 0
    let totalOvervotes = 0
    let totalDuplicateRanks = 0
    let b = ballotsForRaceWithMeta()
    let numBallots = b.length;
    let sorts = []
    const detectSkippedRank = (vote, j) => {
        let sortedScores = vote.scores.map(s => s.score).sort((a, b) => (a??-1)-(b??-1))
        let result = sortedScores.some((score, i) => {
            let prev = (i==0)? null : sortedScores[i-1];
            if(prev == null && score != null && score > 1) return true;
            if(prev != null && (score - prev) > 1) return true;
            return false;
        })
        if(result){
            if(sortedScores[0] == 1 && sortedScores[1] == 2 && sortedScores[2] == 4){
                sorts.push(vote.scores.map(s => s.score).join('-'));
            }
        }
        return result
    }

    b.forEach((vote, j) => {
        if(vote.overvote_rank != null && vote.overvote_rank > 0){
            totalOvervotes++;
        }else if(detectSkippedRank(vote, j)){
            totalSkippedVotes++;
        }else if(false/*TODO: duplicate rank check*/){
            totalDuplicateRanks++;
        }
    })

    let errorVotes = totalOvervotes + totalSkippedVotes + totalDuplicateRanks;
    const voterErrorData = [
        {name: 'No Error', value: results.summaryData.nTallyVotes - errorVotes},
        {name: 'Overvoted', value: totalOvervotes },
        {name: 'Skipped Rank', value: totalSkippedVotes },
        {name: 'Duplicate Ranks', value: totalDuplicateRanks},
    ];

    let voidedVotes = results.nExhaustedViaDuplicateRank + results.nExhaustedViaOvervote + results.nExhaustedViaSkippedRank;
    const voidedErrorData = [
        {name: 'Vote Counted', value: results.summaryData.nTallyVotes - voidedVotes},
        {name: 'Voided by Overvote', value: results.nExhaustedViaOvervote},
        {name: 'Voided by Skipped Rank', value: results.nExhaustedViaSkippedRank},
        {name: 'Voided by Duplicate Rank', value: results.nExhaustedViaDuplicateRank},
    ];

    return <Widget title={'Voter Errors'} >
        <Box width='100%' display='flex' flexDirection='column' gap={4}>
            <Box>
                <Typography><b>{Math.round(100*results.summaryData.nAbstentions / totalVotes)}%</b> of voters abstained from this race</Typography>
                <ResultsBarChart data={abstentionData} xKey='value' percentage/>
            </Box>
            {/* Voter Errors */}
            <Box>
                <Typography><b>{Math.round(100*errorVotes / totalVotes)}%</b> of voters filled out their ballot incorrectly</Typography>
                <ResultsBarChart data={voterErrorData} xKey='value' percentage/>
            </Box>
            {/* Voided Ballots */}
            <Box>
                <Typography><b>{Math.round(100*voidedVotes / totalVotes)}%</b> of voters had their votes voided due to a voter error</Typography>
                <ResultsBarChart data={voidedErrorData} xKey='value' percentage/>
            </Box>

            <Box>
                <Typography>via duplicate: {results.nExhaustedViaDuplicateRank}</Typography>
                <Typography>total overvote: {totalOvervotes}</Typography>
                <Typography>via overvote: {results.nExhaustedViaOvervote}</Typography>
                <Typography>total skipped ranks: {totalSkippedVotes}</Typography>
                <Typography>via skipped rank: {results.nExhaustedViaSkippedRank}</Typography>
                <Typography>abstentions: {results.summaryData.nAbstentions}</Typography>
                {/* I don't include out of bounds votes since it's not possible in most cases*/}
                {/*<Typography>{results.summaryData.nOutOfBoundsVotes}</Typography>*/}
                <Typography>tallyVotes: {results.summaryData.nTallyVotes} {b.length}</Typography>
            </Box>
        </Box>
    </Widget>
}