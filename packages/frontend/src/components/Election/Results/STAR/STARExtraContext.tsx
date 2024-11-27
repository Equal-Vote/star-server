import { ElectionResults, starResults } from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import { Paper, Typography, useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface STARExtraContextProps {
    results: starResults
}

const STARExtraContext = ({ results }: STARExtraContextProps) => {
    const { t } = useTranslation();
    const isSmallScreen = useMediaQuery('(max-width: 1065px)'); 
    // const width = isSmallScreen ? '500px' : '1030px';
    const width = 'auto';
    // This assumes that the candidates are sorted by score, except the winner is always first.
    // So we can just see if the first candidate has a lower score than the second to determine if the winner has a lower score than the runoff
    if (results.summaryData.totalScores[0].score < results.summaryData.totalScores[1].score) {
        return (
            <Paper elevation={4} sx={{ width: width, margin: 'auto', textAlign: 'left', padding: 3, marginTop: 2 }}>
                <b>{t('results.star.score_higher_than_runoff_title')}</b>
                <hr />
                <Typography>
                    {t('results.star.score_higher_than_runoff_text')}
                </Typography>
            </Paper>
        );
    }

    return null; // Return null if the condition is not met
}

export default STARExtraContext;