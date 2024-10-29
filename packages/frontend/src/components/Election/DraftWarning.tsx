import { Box, Paper, Typography } from "@mui/material";
import { useSubstitutedTranslation } from "../util";
import useElection from "../ElectionContextProvider";

export default () => {
    const { t, election } = useElection();

    if(election.state !== 'draft') return <></>

    return <Paper sx={{display: 'flex', flexDirection: 'row', maxWidth: 600, gap: 2, padding: 2, m: 'auto', mb:4}}>
        <Typography component="h3">⚠️</Typography>
        <Box>
            <Typography component="p"><b>{t('draft_warning.title')}</b></Typography>
            <hr/>
            <Typography component="p">{t('draft_warning.description')}</Typography>
        </Box>
    </Paper>
}