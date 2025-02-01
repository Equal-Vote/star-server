import useElection from "~/components/ElectionContextProvider";
import ResultsBarChart from "../components/ResultsBarChart"
import Widget from "../components/Widget"
import useAnonymizedBallots from "~/components/AnonymizedBallotsContextProvider";
import { Candidate } from "@equal-vote/star-vote-shared/domain_model/Candidate";

export default ({frontRunners}: {frontRunners: Candidate[]}) => {
    const {t} = useElection();
    const {ballotsForRace} = useAnonymizedBallots();

    const equalPreferences = new Array(6).fill(0);
    
    let fids = frontRunners.map(f => f.candidate_id);
    let b = ballotsForRace()
    b.forEach((scores, j) => {
        let refScores = scores.filter((score) => fids.includes(score.candidate_id));
        if(refScores[0].score == refScores[1].score) equalPreferences[refScores[0].score]++;
    })

    return <Widget title={t('results.star.equal_preferences_title')}>
        <ResultsBarChart data={equalPreferences.map((count, i) => ({name: `${i}⭐`, count})).reverse()} xKey='count' percentage={true} sortFunc={false}/>
    </Widget>
}