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

    let numAtDiff = [];

    const incIndex = (arr, index) => {
        if(index < 0) return; // Quick Hack to keep the page from crashing
        while(index >= arr.length){
            arr.push({
                name: arr.length,
                count: 0
            });
        }
        arr[index].count++;
    }

    ballotsForRace().forEach((scores) => {
        incIndex(numAtDiff,
            scores.reduce((prev,score) => Math.max(prev, score.score), 0) - 
            scores.reduce((prev,score) => Math.min(prev, score.score), 20)
        )
    })

    return <Widget title={t(`results_ext.score_range_title`)}>
        <Typography variant='h6'>{t(`results_ext.score_range_sub_title`)}</Typography>
        <ResultsBarChart data={numAtDiff.reverse()} xKey='count' percentage={true} sortFunc={false}/>
        <Typography sx={{'textAlign': 'left'}}>{t(`results_ext.score_range_warning`)}</Typography>
    </Widget>
}