import React, { useContext, useEffect, useRef, useState } from 'react'
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LandingPageHero from './LandingPage/LandingPageHero';
import LandingPageFeatureElections from './LandingPage/LandingPageFeaturedElections';
import LandingPageFeatures from './LandingPage/LandingPageFeatures';
import LandingPageSignUpBar from './LandingPage/LandingPageSignUpBar';
import LandingPageTestimonials from './LandingPage/LandingPageTestimonials';
import { Button, Paper } from '@mui/material';
import LandingPagePricing from './LandingPage/LandingPagePricing';
import useFeatureFlags from './FeatureFlagContextProvider';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import { useGetGlobalElectionStats } from '~/hooks/useAPI';
import LandingPageStats from './LandingPage/LandingPageStats';
import ReturnToClassicDialog, { ReturnToClassicContext, ReturnToClassicContextProvider } from './ReturnToClassicDialog';
import { useSubstitutedTranslation } from './util';

const LandingPage = () => {
    const flags = useFeatureFlags();

    const boxRef = useRef(null);

    const [atTop, setAtTop] = useState(true);

    useEffect(() => {
        const handleScroll = (e) => {
            setAtTop(window.scrollY == 0);
        };
        
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const {t} = useSubstitutedTranslation('election');

    const returnToClassicContext = useContext(ReturnToClassicContext);

    //apparently box doesn't have onScroll
    return (
        <div ref={boxRef}>
        <Box sx={{ position: 'fixed', display: {md: 'flex', xs: 'none'}, flexDirection: 'column-reverse', alignItems: 'flex-end', width: '100%', height: '100%',paddingBottom: '150px', paddingRight: '30px'}}>
            <Button variant='contained' sx={{width: '170px', fontWeight: 'bold', fontSize: 10, backgroundColor: '#006063'}} onClick={returnToClassicContext.openDialog}>
                {t('return_to_classic.button')}
            </Button>
        </Box>
        <Box sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '10rem',
            minHeight: '600px',
            margin: 'auto',
            paddingTop: '8rem',
            paddingBottom: '8rem',
        }}>
            <Box sx={{position:'absolute', top: '95vh', width: '100%', textAlign: 'center'}}>
                <KeyboardArrowDownRoundedIcon sx={{
                    display: {xs:'none', md: 'inline'},
                    opacity: atTop? .75 : 0,
                    transition: 'opacity .5s',
                    transform: 'scale(1.8)',
                    animation: 'scrollArrowAnimation 2.5s ease-out 0s infinite',
                    animationDirection: 'alternate'
                }}/>
            </Box>
            <LandingPageHero />
            <LandingPageFeatureElections electionIds={
                (process.env.REACT_APP_FEATURED_ELECTIONS ?? '').split(',')
            }/>
            <LandingPageStats/> 
            <LandingPageFeatures/>
            <LandingPageSignUpBar />
            {flags.isSet('ELECTION_TESTIMONIALS') && <LandingPageTestimonials testimonials={[
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
            ]} />}
            <LandingPagePricing options={[
                {
                    title: 'Free Tier',
                    price: <b>$0.00</b>,
                    description: <>Unlimited voters for Public elections<br /><br />Private elections up to 100 voters</>
                },
                {
                    title: 'Professional',
                    price: <><b>Contact for quote</b></>,
                    description: <>Private elections over 100 voters<br /><br />All proceeds go to non-profit use<br /><br />Discounts are available on request<br /><br />Email elections@equal.vote</>
                },
            ]} />
        </Box>
        </div>
    )
}

export default LandingPage
