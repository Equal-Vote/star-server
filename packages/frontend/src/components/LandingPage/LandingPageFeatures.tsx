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

    const panels = t('landing_page.features.items') as FeaturePanel[];

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'darkShade.main',
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
                <Typography variant='h4' sx={{textAlign: 'center', color: 'darkShade.contrastText'}}>{t('landing_page.features.title')}</Typography>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    paddingTop: '2rem',
                    gap: '2rem',
                }}>
                    {panels.map((panel, i) => <Box key={i}>
                        <Typography variant='h4' sx={{color: 'darkShade.contrastText'}}>{panel.title}</Typography>
                        <Typography component='p' sx={{color: 'darkShade.contrastText'}}>{panel.text}</Typography>
                    </Box>)}
                </Box>
            </Box>
        </Box>
    )
}