import { Box, Paper, Typography } from '@mui/material'
import React from 'react'
import { useThemeSelector } from '../../theme'
import { useSubstitutedTranslation } from '../util'

export default () => {
    
    const themeSelector = useThemeSelector()

    const {t} = useSubstitutedTranslation();
    const options = t('landing_page.pricing.items')
    console.log('professional pricing', options[1]);

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
            <Typography variant='h4' sx={{textAlign: 'left'}}>{t('landing_page.pricing.title')}</Typography>
        </Box>
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '5rem',
            p: { xs: 4},
            justifyContent: 'center',
            flexWrap: 'wrap',
        }}>
            {options.map((option, i) => 
                <Paper key={i} className='pricingOption' elevation={8} sx={{
                    width: '100%',
                    maxWidth: '25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: '0',
                    p: { xs: 2, md: 2 },
                }}>
                    <Typography variant='h5'>{option.title}</Typography>
                    <Typography variant='h6'><b>{option.price}</b></Typography>
                    <Typography variant='h6'>{option.description}</Typography>
                </Paper>
            )}
        </Box>
    </Box>
}