import { useContext, useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box';
import LandingPageFeatures from './LandingPage/LandingPageFeatures';
import LandingPageSignUpBar from './LandingPage/LandingPageSignUpBar';
import LandingPageTestimonials from './LandingPage/LandingPageTestimonials';
import { Button, Typography } from '@mui/material';
import LandingPagePricing from './LandingPage/LandingPagePricing';
import useFeatureFlags from './FeatureFlagContextProvider';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import LandingPageStats from './LandingPage/LandingPageStats';
import { ReturnToClassicContext } from './ReturnToClassicDialog';
import{useLocation} from 'react-router-dom';
import { openFeedback, useSubstitutedTranslation } from './util';
import QuickPoll from './ElectionForm/QuickPoll';
import { PrimaryButton } from './styles';
import LandingPageSupport from './LandingPage/LandingPageSupport';
import LandingPageCarousel from './LandingPage/LandingPageCarousel';

const LandingPage = () => {

    const checkUrl = useLocation();
    useEffect(() =>{
        if(checkUrl.pathname === "/Feedback")
        {
            openFeedback();
        }
           
    }, [checkUrl]);

    
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

    //apparently box doesn't have onScroll
    return (
        <div ref={boxRef}>
       
        <Box className='gradBackground' sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            margin: 'auto',
        }}> 
            <Box display='flex' flexDirection='column' sx={{
                margin: 'auto',
                width: '100%',
                maxWidth: '1200px',
                p: { xs: 2, md: 2 },
                alignItems: 'center',
                textAlign: 'center',
            }}>
                <Typography variant="h4" color={'lightShade.contrastText'}> {t('landing_page.hero.title')} </Typography>
                <LandingPageCarousel />
            </Box>
            {/* temporarily disabling because it was sending continuous requests to the backend for some reason */}
            {/*<LandingPageFeatureElections electionIds={(process.env.REACT_APP_FEATURED_ELECTIONS ?? '').split(',')}/>*/}
            <LandingPageStats/>
            <QuickPoll/>
            <LandingPageFeatures/>
            <LandingPageSignUpBar />
            {flags.isSet('ELECTION_TESTIMONIALS') && <LandingPageTestimonials/>}
            <LandingPagePricing />
            <LandingPageSupport />
        </Box>
        </div>
    )
}

export default LandingPage
