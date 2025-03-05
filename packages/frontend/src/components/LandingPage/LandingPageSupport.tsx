import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import { PrimaryButton } from '../styles';
import useAuthSession from '../AuthSessionContextProvider';
import { useThemeSelector } from '../../theme';
import { useSubstitutedTranslation } from '../util';

export default () => {
    const authSession = useAuthSession()
    const themeSelector = useThemeSelector()
    const {t} = useSubstitutedTranslation();

    return (
        <Box sx={{
            background: themeSelector.mode === 'darkMode' ? 'brand.gray5' : 'brand.gray1',
            clip: 'unset',
            width: '100%',
            p: { xs: 2},
            mb: '2rem', // matching the gap from the root flex box
        }}>
            <Box sx={{
                width: '100%',
                maxWidth: '650px',
                margin: 'auto',
                display: 'flex',
                flexDirection: {xs: 'column', md: 'row'},
                alignContent: 'center',
                justifyContent: 'space-between',
            }}>
                <Typography variant='h6' sx={{textAlign: {xs: 'center', md: 'left'}}}>Help support the project!</Typography>
                {/*I just copied styled button but removed the full width*/ }
                <PrimaryButton href='/volunteer'>
                    Volunteer
                </PrimaryButton>
                <PrimaryButton href='https://equal.vote/donate'>
                    Donate
                </PrimaryButton>
            </Box>
        </Box>
    )
}