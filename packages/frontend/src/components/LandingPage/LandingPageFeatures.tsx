import { Box, Grid, Typography } from '@mui/material'
import React from 'react'
import FeaturedElection from './FeaturedElection'
import { useSubstitutedTranslation } from '../util';


interface FeaturePanel{
    title: string;
    text: string;
}

export default () => {
    let {t} = useSubstitutedTranslation('election');

    const panels = t('features.items') as FeaturePanel[];

    return  <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'brand.gray1',
        clip: 'unset',
        width: '100%',
        p: { xs: 2},
    }}>
        <Box sx={{
            width: '100%',
            maxWidth: '1300px',
            margin: 'auto',
            p: { xs: 2, md: 4 },
        }}>
            <Typography variant='h4' sx={{textAlign: 'center'}}>{t('features.title')}</Typography>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                paddingTop: '5rem',
                gap: '3rem',
                backgroundColor: 'brand.gray1',
            }}>
                {panels.map(panel => <Box sx={{width: '380px'}}>
                    <Typography variant='h4'>{panel.title}</Typography>
                    <Typography component='p'>{panel.text}</Typography>
                </Box>)}
            </Box>
        </Box>
    </Box>
}