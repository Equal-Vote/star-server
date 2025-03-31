import useElection from "~/components/ElectionContextProvider";
import ResultsBarChart from "../components/ResultsBarChart"
import Widget from "../components/Widget"
import useAnonymizedBallots from "~/components/AnonymizedBallotsContextProvider";
import { Candidate } from "@equal-vote/star-vote-shared/domain_model/Candidate";
import { getEntry } from "@equal-vote/star-vote-shared/domain_model/Util";

export default ({frontRunners}: {frontRunners: Candidate[]}) => {
    const {t} = useElection();
    const {ballotsForRace} = useAnonymizedBallots();

    const equalPreferences = new Array(6).fill(0);
    
    let b = ballotsForRace()
    b.forEach(scores => {
        let topScores = ([0, 1]).map(i => getEntry(scores, frontRunners[i].candidate_id, 'candidate_id').score);
        if(topScores[0] == topScores[1]) equalPreferences[topScores[0]]++;
    })

    return <Widget title={t('results.star.equal_preferences_title')} wide>
        <ResultsBarChart data={equalPreferences.map((count, i) => ({name: `${i}⭐`, count})).reverse()} xKey='count' percentage={true} sortFunc={false}/>
    </Widget>
}