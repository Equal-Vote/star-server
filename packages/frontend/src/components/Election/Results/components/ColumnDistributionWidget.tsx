import useAnonymizedBallots from "~/components/AnonymizedBallotsContextProvider";
import Widget from "./Widget";
import useRace from "~/components/RaceContextProvider";
import { Divider, Typography } from "@mui/material";
import ResultsBarChart from "./ResultsBarChart";
import useFeatureFlags from "~/components/FeatureFlagContextProvider";

// candidates helps define the order
export default () => {
    const {ballotsForRace} = useAnonymizedBallots();
    const {t, race} = useRace();

    const flags = useFeatureFlags();
    if(!flags.isSet('ALL_STATS')) return <></>

    let numColumns = [];
    let whichColumns = [];
    let totalColumns = 0;

    const incIndex = (arr, key) => {
        let index = (arr == numColumns) ? key-1 : key;
        while(index >= arr.length ){
            arr.push({
                name: (arr == numColumns)? arr.length + 1 : arr.length,
                count: 0
            });
        }
        arr[index].count++;
    }

    let b = ballotsForRace()
    b.forEach((scores, j) => {
        [...new Set(scores.map(score => score.score ?? 0))].forEach(score => incIndex(whichColumns, score));

        let definedScores = scores.filter(score => score.score !== undefined && score.score !== null);
        totalColumns += definedScores.length;
        incIndex(numColumns, definedScores.length);
    })

    whichColumns = whichColumns.map(c => ({...c, name: c.name == 'blank'? 'blank' : `${c.name}⭐`}))

    return <Widget title={t(`results.column_distribution_title`)}>
        <Typography variant='h6'>{t(`results.column_distribution_num_avg`, {count: Math.round(100*totalColumns / b.length)/100})}</Typography>
        <Divider/>
        <Typography variant='h6'>{t(`results.column_distribution_num_title`)}</Typography>
        <ResultsBarChart data={numColumns} xKey='count' percentage={true} sortFunc={false}/>
        <Divider/>
        {(race.voting_method == 'STAR' || race.voting_method == 'STAR_PR') && <>
            <Typography variant='h6'>{t('results.column_distribution_which_title')}</Typography>
            <ResultsBarChart data={whichColumns} xKey='count' percentage={true} sortFunc={false} percentDenominator={b.length}/>
        </>}
    </Widget>
}