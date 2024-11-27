import { Box, Paper, Typography } from "@mui/material";
import useElection from "../ElectionContextProvider";
import { Support, SupportAgent, SupportAgentOutlined, SupportAgentRounded } from "@mui/icons-material";

export default () => {
    const { t, election } = useElection();

    if(election.settings.contact_email === undefined || election.settings.contact_email === '') return <></>

    return <Box display='flex' flexDirection='row' justifyContent='center' gap={1} 
        sx={{mt: 3, mx: 'auto', textAlign: 'center'}}
    >
        <SupportAgent/>
        <Typography>{t('support_blurb', {email: election.settings.contact_email})}</Typography>
    </Box>
}