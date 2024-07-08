import { Box, Typography } from '@mui/material'
import React from 'react'
import FeaturedElection from './FeaturedElection'
import { useThemeSelector } from '../../theme'

export default ({electionIds}) => {
    const themeSelector = useThemeSelector()
    return <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: themeSelector.mode === 'darkMode' ? 'brand.gray5' : 'brand.gray1',
        clip: 'unset',
        width: '100%',
        p: { xs: 2},
    }}>
        <Box sx={{
            width: '100%',
            maxWidth: '1300px',
            margin: 'auto',
        }}>
            <Typography variant='h4' sx={{textAlign: 'center'}}>Vote in a Featured Public Election</Typography>
        </Box>
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '2rem',
            p: { xs: 4},
            justifyContent: 'center',
            flexWrap: 'wrap',
        }}>
            {electionIds.map((electionId,i) => <FeaturedElection key={i} electionId={electionId}/>)}
        </Box>
    </Box>
}