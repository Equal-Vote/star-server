import React from 'react'
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import QuickPoll from './ElectionForm/QuickPoll';
import LandingPageHero from './LandingPage/LandingPageHero';

const LandingPage = ({ authSession }) => {
    return (
       <LandingPageHero authSession={authSession}/>
    )
}

export default LandingPage
