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
import { Paper } from '@mui/material';
import LandingPagePricing from './LandingPage/LandingPagePricing';

const LandingPage = ({ authSession }) => {
    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '15rem',
            minHeight: '600px',
            margin: 'auto',
            paddingTop: '8rem',
            paddingBottom: '8rem',
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
            <LandingPagePricing options={[
                {
                    title: 'Free Tier',
                    price: <b>$0.00</b>,
                    description: <>Unlimited voters for Public elections<br/><br/>Private elections up to 100 voters</>
                },
                {
                    title: 'Professional',
                    price: <><b>Contact for quote</b></>,
                    description: <>Private elections over 100 voters<br/><br/>All proceeds go to non-profit use<br/><br/>Discounts are available on request<br/><br/>Email elections@equal.vote</>
                },
            ]}/>
        </Box>
    )
}

export default LandingPage
