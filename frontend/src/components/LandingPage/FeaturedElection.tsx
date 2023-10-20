import { Paper, Typography } from "@mui/material";
import React from 'react';

export default ({electionId}) => {
    return <Paper className='featuredElection' elevation={8} sx={{
        width: '20rem',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: '0',
        p: { xs: 2, md: 2 },
    }}>
        <Typography variant='h5'>Election Title</Typography>
        <Typography variant='h6'>election info</Typography>
        <Typography variant='h6'>election info</Typography>
    </Paper>
}