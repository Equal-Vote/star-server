import { irvResults } from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import useAnonymizedBallots from "~/components/AnonymizedBallotsContextProvider";
import useElection from "~/components/ElectionContextProvider";
import useRace from "~/components/RaceContextProvider";
import Widget from "./Widget";
import { Box, Typography } from "@mui/material";
import RectPieChart from "./RectPieChart";
import ResultsBarChart from "./ResultsBarChart";
import { formatPercent } from "~/components/util";

export default () => {
    const {t, election} = useElection();
    const {ballots, ballotsForRaceWithMeta} = useAnonymizedBallots();
    let {results, race} = useRace();
    results = results as irvResults

    if(election.public_archive_id === '') return <></>

    const totalVotes = results.summaryData.nAbstentions + results.summaryData.nTallyVotes;

    const abstentionData = [
        {name: 'Tallied Votes', votes: results.summaryData.nTallyVotes},
        {name: 'Abstentions', votes: results.summaryData.nAbstentions},
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
        // I'm giving duplicate rank precedence since duplicate rank ballots get cast to skipped rank ballots under our format
        }else if(vote.has_duplicate_rank){ 
            totalDuplicateRanks++;
        }else if(detectSkippedRank(vote, j)){
            totalSkippedVotes++;
        }
    })

    let errorVotes = totalOvervotes + totalSkippedVotes + totalDuplicateRanks;
    const voterErrorData = [
        {name: 'No Error', votes: results.summaryData.nTallyVotes - errorVotes},
        {name: 'Overvoted', votes: totalOvervotes },
        {name: 'Skipped Rank', votes: totalSkippedVotes },
        {name: 'Duplicate Ranks', votes: totalDuplicateRanks},
    ];

    let voidedVotes = results.nExhaustedViaDuplicateRank + results.nExhaustedViaOvervote + results.nExhaustedViaSkippedRank;
    const voidedErrorData = [
        {name: 'Vote Counted', votes: results.summaryData.nTallyVotes - voidedVotes},
        {name: 'Voided by Overvote', votes: results.nExhaustedViaOvervote},
        {name: 'Voided by Skipped Rank', votes: results.nExhaustedViaSkippedRank},
        {name: 'Voided by Duplicate Rank', votes: results.nExhaustedViaDuplicateRank},
    ];

    return <Widget title={'Voter Errors'} >
        <Box width='100%' display='flex' flexDirection='column' gap={4}>
            <Box>
                <Typography><b>{formatPercent(results.summaryData.nAbstentions / totalVotes)}</b> of voters abstained from this race</Typography>
                <ResultsBarChart data={abstentionData} xKey='votes' percentage/>
            </Box>

            <Box>
                <Typography><b>{formatPercent(errorVotes / totalVotes)}</b> of voters filled out their ballot incorrectly</Typography>
                <ResultsBarChart data={voterErrorData} xKey='votes' percentage/>
            </Box>

            <Box>
                <Typography><b>{formatPercent(voidedVotes / totalVotes)}</b> of voters had their votes voided due to a voter error</Typography>
                <ResultsBarChart data={voidedErrorData} xKey='votes' percentage/>
            </Box>

            <Box>
                {election.settings.exhaust_on_N_repeated_skipped_marks ? 
                <Typography>This jurisdiction voided ballots if they had {election.settings.exhaust_on_N_repeated_skipped_marks} or more repeated skipped ranks</Typography>
                :
                <Typography>This jurisdiction did not void ballots regardless of the number of skipped ranks</Typography>
                }
            </Box>
        </Box>
    </Widget>
}