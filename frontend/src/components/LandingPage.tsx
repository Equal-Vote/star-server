import React from 'react'
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import QuickPoll from './ElectionForm/QuickPoll';
import LandingPageHero from './LandingPage/LandingPageHero';
import LandingPageFeatureElections from './LandingPage/LandingPageFeaturedElections';
import LandingPageFeatures from './LandingPage/LandingPageFeatures';
import LandingPageSignUpBar from './LandingPage/LandingPageSignUpBar';
import LandingPageTestimonials from './LandingPage/LandingPageTestimonials';

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
            <LandingPageTestimonials testimonials={[
                {
                    quote: 'STAR Voting is Awesome!',
                    name: 'John Doe',
                    url: 'https://yt3.googleusercontent.com/el7OsIUIJVHjHIwsNXgrBVft0Ht3RSfJ3wO94MQivXaa_IK0JMGlHrPIbvt8fYtXvjJfErcdG-Y=s176-c-k-c0x00ffffff-no-rj'
                },
                {
                    quote: 'STAR Voting is Awesome!',
                    name: 'Jane Doe',
                    url: 'https://yt3.googleusercontent.com/el7OsIUIJVHjHIwsNXgrBVft0Ht3RSfJ3wO94MQivXaa_IK0JMGlHrPIbvt8fYtXvjJfErcdG-Y=s176-c-k-c0x00ffffff-no-rj'
                },
                {
                    quote: 'STAR Voting is Awesome!',
                    name: 'Equal Vote',
                    url: 'https://yt3.googleusercontent.com/el7OsIUIJVHjHIwsNXgrBVft0Ht3RSfJ3wO94MQivXaa_IK0JMGlHrPIbvt8fYtXvjJfErcdG-Y=s176-c-k-c0x00ffffff-no-rj'
                },
            ]}/>
        </Box>
    )
}

export default LandingPage
