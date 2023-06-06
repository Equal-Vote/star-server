import React from 'react'
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import { StyledButton } from '../styles';

export default function SummaryPage({ election, onBack, onSubmit, submitText }) {
    // blocks back button and calls onBack function instead
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = () => {
        onBack()
    }

    return (
        <div>
            <Grid container
                sx={{
                    m: 0,
                    p: 1,
                }}
            >
                <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                    <Typography align='center' variant="h4" component="h4" fontWeight={'bold'}>
                        Summary
                    </Typography>
                </Grid>
                <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                    <Typography align='left' variant="body1">
                        {`Election Title: ${election.title}`}
                    </Typography>
                </Grid>
                <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                    <Typography align='left' variant="body1">
                        {`Description: ${election.description}`}
                    </Typography>
                </Grid>
                <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                    <Typography align='left' variant="body1">
                        {`Start: ${election.start_time ? new Date(election.start_time).toLocaleString() : 'none'}`}
                    </Typography>
                </Grid>
                <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                    <Typography align='left' variant="body1">
                        {`End: ${election.end_time ? new Date(election.end_time).toLocaleString() : 'none'}`}
                    </Typography>
                </Grid>
                {election.races.map((race, index) => (
                    <>
                        <Grid item xs={12} sx={{ m: 0, p: 1, pt: 3 }}>
                            <Typography align='left' variant="body1">
                                {race.title ? race.title : `Race ${index + 1}`}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                            <Typography align='left' variant="body1">
                                {`Voting Method: ${race.voting_method}`}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                            <Typography align='left' variant="body1">
                                {`Number of Winners: ${race.num_winners}`}
                            </Typography>
                        </Grid>
                    </>
                ))

                }
                {
                    //TODO: add text for each scenario or each setting
                }

                <Grid item xs={3} sx={{ m: 0, p: 1, pt: 2 }}>
                    <StyledButton
                        type='button'
                        variant="contained"
                        width="100%"
                        onClick={() => {
                            onBack()
                        }
                        }>
                        Back
                    </StyledButton>
                </Grid>
            <Grid item xs={5}></Grid>
                <Grid item xs={4} sx={{ m: 0, p: 1 }}>
                    <StyledButton
                        type='button'
                        variant="contained"
                        onClick={() => {
                            onSubmit()
                        }
                        }>
                        {submitText}
                    </StyledButton>
                </Grid>
            </Grid>
        </div>
    )

}