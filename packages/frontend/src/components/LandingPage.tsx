import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box';
import LandingPageFeatures from './LandingPage/LandingPageFeatures';
import LandingPageSignUpBar from './LandingPage/LandingPageSignUpBar';
import LandingPageTestimonials from './LandingPage/LandingPageTestimonials';
import { Typography } from '@mui/material';
import LandingPagePricing from './LandingPage/LandingPagePricing';
import useFeatureFlags from './FeatureFlagContextProvider';
import LandingPageStats from './LandingPage/LandingPageStats';
import{useLocation} from 'react-router-dom';
import { openFeedback, useSubstitutedTranslation } from './util';
import QuickPoll from './ElectionForm/QuickPoll';
import LandingPageSupport from './LandingPage/LandingPageSupport';
import LandingPageCarousel from './LandingPage/LandingPageCarousel';
import LandingPageFeaturedElections from './LandingPage/LandingPageFeaturedElections';

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

    //It looks like atTop wasn't being used anywhere, so I'm just removing this chunk for now

    // const [atTop, setAtTop] = useState(true);

    // useEffect(() => {
    //     const handleScroll = () => {
    //         setAtTop(window.scrollY == 0);
    //     };

    //     window.addEventListener("scroll", handleScroll);
    //     return () => window.removeEventListener("scroll", handleScroll);
    // }, []);

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
            <LandingPageStats/>
            <QuickPoll/>
            <LandingPageFeaturedElections electionIds={(process.env.REACT_APP_FEATURED_ELECTIONS ?? '').split(',')}/>
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
