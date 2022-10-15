import React from 'react'
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
const LandingPage = () => {
    return (
        <Box style={{
            width: '100%',
            display: 'flex',
            minHeight: '600px',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Grid container spacing={6} style={{
                display: 'flex',
                alignItems: 'center',
                maxWidth: '1300px',
                padding: '50px',
            }}>
                <Grid item xs={12} md={7}>
                    <Typography variant="h3" style={{ fontWeight: 700, paddingBottom: '15px' }} >
                        STAR Voting Election Hosting
                    </Typography>
                    <Typography variant="h6" style={{
                        opacity: '0.4',
                    }}>
                        Open source election software
                    </Typography>
                    <Typography variant="h6" style={{
                        opacity: '0.4',
                    }}>
                        From quick polls to highly secure elections
                    </Typography>
                    <Typography variant="h6" style={{
                        opacity: '0.4',
                        paddingBottom: '30px',
                    }}>
                        Voting methods approved by the Equal Vote Coalition
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ width: '200px', fontSize: '16px' }}
                        href= '/CreateElection'
                    >
                        Create Election
                    </Button>
                </Grid>
                <Grid item xs={12} md={5}>
                    <img src={require('../images/ballot.png')} alt="Sample" width={'300px'} />
                </Grid>
            </Grid>
        </Box>
    )
}

export default LandingPage
