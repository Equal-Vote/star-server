import { Box, Grid, Typography } from '@mui/material'
import React from 'react'
import FeaturedElection from './FeaturedElection'
import { useOnScrollAnimator, useSubstitutedTranslation } from '../util';


interface FeaturePanel{
    title: string;
    text: string;
}

export default () => {
    let {t} = useSubstitutedTranslation('election');

    const panels = t('landing_page.features.items') as FeaturePanel[];

    const {FadeIn, FadeUp} = useOnScrollAnimator();
    return  <FadeIn>
        <Box sx={{
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
                <Typography variant='h4' sx={{textAlign: 'center'}}>{t('landing_page.features.title')}</Typography>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    paddingTop: '5rem',
                    gap: '3rem',
                    backgroundColor: 'brand.gray1',
                }}>
                    {panels.map((panel, i) => <Box key={i}><FadeUp delay={`${i*100}ms`}><Box sx={{width: {xs: '100%', md: '380px'}}}>
                        <Typography variant='h4'>{panel.title}</Typography>
                        <Typography component='p'>{panel.text}</Typography>
                    </Box></FadeUp></Box>)}
                </Box>
            </Box>
        </Box>
    </FadeIn>
}