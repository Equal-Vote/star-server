import { Box, Grid, Typography } from '@mui/material'
import React from 'react'
import FeaturedElection from './FeaturedElection'
import { useTranslation } from 'react-i18next';

interface FeaturePanel{
    title: string;
    text: string;
}

export default () => {
    let rowSxProps = {
        paddingLeft: 5,
        display: 'flex',
        flexDirection: {xs: 'column', lg: 'row'},
        width: '100%',
        maxWidth: '110rem',
        gap: {xs: '0rem', lg: '8rem'},
    };

    let itemSxProps= {
        flexShrink: '0',
        width: {xs: '100%', lg: '35%'},
    };

    let {t} = useTranslation();

    const panels = t('features.items', {returnObjects: true}) as FeaturePanel[];

    return <Box sx={{
        width: '100%',
        maxWidth: '1300px',
        margin: 'auto',
        p: { xs: 2, md: 2 },
    }}>
        <Typography variant='h4' sx={{textAlign: 'center'}}>{t('features.title')}</Typography>
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            paddingTop: '5rem',
            gap: '3rem',
        }}>
            {panels.map(panel => <Box sx={{width: '380px'}}>
                <Typography variant='h4'>{panel.title}</Typography>
                <Typography component='p'>{panel.text}</Typography>
            </Box>)}
        </Box>
    </Box>
}