import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import React from 'react'
import QuickPoll from '../ElectionForm/QuickPoll'

export default ({authSession}) => {
    return (
        <Box sx={{
            maxWidth: '1300px',
            margin: 'auto',
            p: { xs: 2, md: 2 },
        }}>
            <Grid container >
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
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '70%',
                        marginLeft: '20px',
                        background: 'var(--brand-gray-2)',
                        p: { xs: 3, md: 3 },
                        gap: '40px',
                    }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}>
                            <Typography variant='h5' sx={{margin: 0}}>Elections Created</Typography>
                            <Typography variant='h5' sx={{margin: 0}}>10001</Typography>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}>
                            <Typography variant='h5' sx={{margin: 0}}>Votes Cast</Typography>
                            <Typography variant='h5' sx={{margin: 0}}>10001</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                    <QuickPoll authSession={authSession} />
                </Grid>
            </Grid>
        </Box>
    )
}