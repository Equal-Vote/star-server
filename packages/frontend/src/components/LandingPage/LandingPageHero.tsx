import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import React, { useRef, useState } from 'react'
import QuickPoll from '../ElectionForm/QuickPoll'
import useAuthSession from '../AuthSessionContextProvider'
import { useThemeSelector } from '../../theme'
import useFeatureFlags from '../FeatureFlagContextProvider'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

export default ({}) => {
    const authSession = useAuthSession();
    const themeSelector = useThemeSelector();
    const flags = useFeatureFlags();
    const [title, _] = useLocalStorage('title_override', process.env.REACT_APP_TITLE);

    const [transitionStep, setTransitionStep] = useState(10000);
    const [methodIndex, setMethodIndex] = useState(0);
    const timeouts = useRef([])

    const methodTitles = [
        'STAR Voting',
        'Approval',
        'Ranked Robin'
    ];

    const methodImages = [
        '/images/star_ballot.png',
        '/images/approval_ballot.png',
        '/images/ranked_ballot.png',
    ];

    const methodOneLiners = [
        'Recommended for accuracy',
        'Recommended for simplicity',
        'Recommended for ranking',
    ];

    const nextMethod = (offset) => {
        setMethodIndex((methodIndex+offset+methodTitles.length)%methodTitles.length);
        // I need the gaps to be at least 17 so that we're guaranteed an animation frame 
        console.log(timeouts);
        timeouts.current.forEach((t) => clearTimeout(t))
        setTransitionStep(0);
        timeouts.current = [
            setTimeout(() => setTransitionStep(1), 0+30),
            setTimeout(() => setTransitionStep(2), 150),
            setTimeout(() => setTransitionStep(3), 150+30),
            setTimeout(() => setTransitionStep(4), 500),
            setTimeout(() => setTransitionStep(5), 500+30),
        ];
    }

    const arrowSX = {transition: 'transform .2s', transform: 'scale(1)', '&:hover': {transform: 'scale(1.3)'}}

    return (
        <Box sx={{
            maxWidth: '1500px',
            margin: 'auto',
            p: { xs: 2, md: 2 },
        }}>
            <Box display='flex' flexDirection='row' sx={{gap: 20}}>
                <Box display='flex' flexDirection='column' sx={{alignItems: 'center', textAlign: 'center'}}>
                    <Typography variant="h4">
                        Create polls and elections with
                    </Typography>
                    <Box width='90%' display='flex' flexDirection='row' justifyContent='space-between' sx={{alignItems: 'center', paddingBottom: 3}}>
                        <ArrowBackIosRoundedIcon sx={arrowSX} onClick={() => nextMethod(-1)}/>
                        <Typography variant="h3" className={transitionStep==0? 'heroGrow' : 'heroShrink'}>
                            {methodTitles[methodIndex]}
                        </Typography>
                        <ArrowForwardIosRoundedIcon sx={arrowSX} onClick={() => nextMethod(1)}/>
                    </Box>
                    <Box
                        className={transitionStep==2? 'heroGrow' : 'heroShrink'} 
                    >
                        <Box
                            height='200px'
                            component='img'
                            src={methodImages[transitionStep < 2 ? (methodIndex+methodTitles.length-1)%methodTitles.length : methodIndex]}
                        />
                        <Typography variant="h4">
                            {methodOneLiners[transitionStep < 2 ? (methodIndex+methodTitles.length-1)%methodTitles.length : methodIndex]}
                        </Typography>
                    </Box>
                    {flags.isSet('ELECTION_TALLY') &&
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '70%',
                            marginLeft: '20px',
                            backgroundColor: themeSelector.mode === 'darkMode' ? 'brand.gray4' : 'brand.gray2',
                            p: { xs: 3, md: 3 },
                            gap: '40px',
                        }}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}>
                                <Typography variant='h5' sx={{margin: 0}}>Elections Created</Typography>
                                <Typography variant='h5' sx={{margin: 0}}>10001</Typography>
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}>
                                <Typography variant='h5' sx={{margin: 0}}>Votes Cast</Typography>
                                <Typography variant='h5' sx={{margin: 0}}>10001</Typography>
                            </Box>
                        </Box>
                    }
                </Box>
                <QuickPoll
                    authSession={authSession}
                    methodName={methodTitles[transitionStep < 4 ? (methodIndex+methodTitles.length-1)%methodTitles.length : methodIndex]}
                    grow={transitionStep == 4}
                />
            </Box>
        </Box>
    )
}