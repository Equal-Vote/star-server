import { Box, Typography } from '@mui/material'
import React from 'react'
import FeaturedElection from './FeaturedElection'

export default ({electionIds}) => {
    return <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--brand-gray-1)',
        clip: 'unset',
        width: '100%',
        p: { xs: 2},
    }}>
        <Box sx={{
            width: '100%',
            maxWidth: '1300px',
            margin: 'auto',
        }}>
            <Typography variant='h4' sx={{textAlign: 'left'}}>Vote in a Featured Public Election</Typography>
        </Box>
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '2rem',
            p: { xs: 4},
            justifyContent: 'center',
            flexWrap: 'wrap',
        }}>
            {electionIds.map(electionId => <FeaturedElection electionId={electionId}/>)}
        </Box>
    </Box>
}