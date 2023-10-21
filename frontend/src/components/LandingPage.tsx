import React from 'react'
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import QuickPoll from './ElectionForm/QuickPoll';
import LandingPageHero from './LandingPage/LandingPageHero';
import LandingPageFeatureElections from './LandingPage/LandingPageFeaturedElections';
import LandingPageFeatures from './LandingPage/LandingPageFeatures';
import LandingPageSignUpBar from './LandingPage/LandingPageSignUpBar';

const LandingPage = ({ authSession }) => {
    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20rem',
            minHeight: '600px',
            justifyContent: 'center',
            margin: 'auto',
            clip: 'unset',
        }}>
            <LandingPageHero authSession={authSession}/>
            <LandingPageFeatureElections electionIds={[
                '52c2b793-bdfe-49e8-b4cf-f448108c39af',
                'e45e93b1-9e4e-4a87-bb80-e7dbbd6e4721',
                '5c84e93b-b01c-4ab0-82ee-7181cb7ac995'
            ]}/>
            <LandingPageFeatures/>
            <LandingPageSignUpBar authSession={authSession}/>
        </Box>
    )
}

export default LandingPage
