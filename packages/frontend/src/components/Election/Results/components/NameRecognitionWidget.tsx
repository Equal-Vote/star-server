import useAnonymizedBallots from "~/components/AnonymizedBallotsContextProvider";
import Widget from "./Widget";
import useRace from "~/components/RaceContextProvider";
import { Divider, Typography } from "@mui/material";
import ResultsBarChart from "./ResultsBarChart";

// candidates helps define the order
export default () => {
    const {ballotsForRace} = useAnonymizedBallots();
    const {t, race} = useRace();

    console.log(race.candidates)
    let numActive = Object.fromEntries(race.candidates.map(c => [c.candidate_id, {
        name: c.candidate_name,
        count: 0,
    }]))

    let b = ballotsForRace()
    b.forEach((scores) => {
        scores.forEach(score => {
            if(score.score == null || score.score == undefined) return;
            numActive[score.candidate_id].count++;
        })
    })

    return <Widget title={t(`results.name_recognition_title`)}>
        <Typography variant='h6'>{t(`results.name_recognition_sub_title`)}</Typography>
        <ResultsBarChart data={Object.values(numActive).sort((a, b) => -(a.count-b.count))} xKey='count' percentage={true} percentDenominator={b.length}/>
        <Typography>{t(`results.name_recognition_blank_warning`)}</Typography>
    </Widget>
}