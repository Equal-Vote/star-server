import React from 'react'
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import QuickPoll from './ElectionForm/QuickPoll';

const LandingPage = ({ authSession }) => {
    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            minHeight: '600px',
            justifyContent: 'center',
            pt: { xs: 0, md: 0 },
        }}>
            <Grid container sx={{
                maxWidth: '1300px',
                p: { xs: 2, md: 2 },
            }}>
                <Grid item xs={12} md={7}>
                    <Typography variant="h3" style={{ fontWeight: 700 }} >
                        STAR Elections
                    </Typography>
                    <Typography variant="h5" style={{
                        opacity: '0.7',
                    }}>
                        Open source election software
                    </Typography>
                    <Typography variant="h5" style={{
                        opacity: '0.7',
                    }}>
                        From quick polls to highly secure elections
                    </Typography>
                    <Typography variant="h5" style={{
                        opacity: '0.7',
                        paddingBottom: '30px',
                    }}>
                        Voting methods approved by the <a target="_blank" href={'https://www.equal.vote'} style={{ color: 'inherit', textDecoration: 'underline' }}>Equal Vote Coalition</a>
                    </Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                    <QuickPoll authSession={authSession} />
                </Grid>
            </Grid>
        </Box>
    )
}

export default LandingPage
