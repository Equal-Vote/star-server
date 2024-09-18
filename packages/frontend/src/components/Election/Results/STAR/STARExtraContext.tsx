import { ElectionResults, starResults } from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import { Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface STARExtraContextProps {
    results: starResults
}

const STAREXtraContext = ({ results  }: STARExtraContextProps) => {
    const {t} = useTranslation();
    //this assumes that the candidates are sorted by score, except the winner is always first. So we can just see if the first
    //candidate has a lower score than the second to determine if the winner has a lower score than the runoff
    if (results.summaryData.totalScores[0].score < results.summaryData.totalScores[1].score) {
    return <Paper elevation={4} sx={{ width: '90%', margin: 'auto', textAlign: 'left', padding: 3, marginTop: 2}}>
        <b>{t('results.star.score_higher_than_runoff_title')}</b>
        <hr/>
        <Typography>
            {t('results.star.score_higher_than_runoff_text')}
        </Typography>
    </Paper>
    }
}

export default STAREXtraContext;