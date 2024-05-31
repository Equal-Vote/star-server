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
import { StyledButton, Tip } from '../styles'
import { useTranslation } from 'react-i18next'

export default ({}) => {
    const authSession = useAuthSession();
    const themeSelector = useThemeSelector();
    const flags = useFeatureFlags();
    const [title, _] = useLocalStorage('title_override', process.env.REACT_APP_TITLE);

    const [transitionStep, setTransitionStep] = useState(10000);
    const [prevMethodIndex, setPrevMethodIndex] = useState(0);
    const [methodIndex, setMethodIndex] = useState(0);
    const timeouts = useRef([])

    const methodKeys = [
        'star_voting',
        'approval',
        'ranked_robin',
        'more_methods'
    ]

    const methodImages = [
        '/images/star_ballot.png',
        '/images/approval_ballot.png',
        '/images/ranked_ballot.png',
        '/images/ranked_ballot.png',
    ];

    const {t} = useTranslation();

    const nextMethod = (offset) => {
        let n = methodIndex + offset;
        if(n < 0 || n >= methodKeys.length) return;
        setPrevMethodIndex(methodIndex);
        setMethodIndex(n);
        // I need the gaps to be at least 17 so that we're guaranteed an animation frame 
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

    const arrowSX = {transition: 'transform .2s', transform: 'scale(1)', '&:hover': {transform: 'scale(1.3)'}};
    let imgIndex = transitionStep < 2 ? prevMethodIndex : methodIndex;
    let quickPollIndex = transitionStep < 4 ? prevMethodIndex : methodIndex;
    if(quickPollIndex == methodKeys.length-1) quickPollIndex = methodKeys.length-2;

    return (
        <>
        <Box display='flex' flexDirection='row' justifyContent='center' flexWrap='wrap' sx={{
            margin: 'auto',
            gap: {s: 6, md: 20}, 
            maxWidth: '1500px',
            p: { xs: 2, md: 2 }
        }}>
            <Box display='flex' flexDirection='column' sx={{
                alignItems: 'center',
                textAlign: 'center',
                width: {xs: '100%', md: '600px'}, // not the same ax maxWidth 600px!, we want to make sure the carousel doesn't effect size on larger screens
                minHeight: '600px'
            }}>
                <Typography variant="h4"> {t('hero.title')} </Typography>
                <Box width='90%' display='flex' flexDirection='row' justifyContent='space-between' sx={{alignItems: 'center', paddingBottom: 3}}>
                    <ArrowBackIosRoundedIcon sx={{...arrowSX, opacity: (methodIndex == 0? 0 : 1)}} onClick={() => nextMethod(-1)}/>
                    <Box display='flex' flexDirection='row' className={transitionStep==0? 'heroGrow' : 'heroShrink'} sx={{alignItems: 'center'}}>
                        <Typography variant="h3">
                            {t(`hero.methods.${methodKeys[methodIndex]}.title`)} 
                        </Typography>
                        {methodIndex != methodKeys.length-1 &&
                            <Box height='100%' sx={{alignItem: 'top'}}>
                                <Tip name={methodKeys[methodIndex]}/>
                            </Box>
                        }
                    </Box>
                    <ArrowForwardIosRoundedIcon sx={{...arrowSX, opacity: (methodIndex == methodKeys.length-1? 0 : 1)}} onClick={() => nextMethod(1)}/>
                </Box>

                <Box
                    className={transitionStep==2? 'heroGrow' : 'heroShrink'} 
                >
                    {imgIndex != methodKeys.length-1 ? <>
                        <Box
                            sx={{
                                width: '65%'
                            }}
                            component='img'
                            src={methodImages[imgIndex]}
                        />
                        <Typography variant="h5">
                            {t(`hero.methods.${methodKeys[imgIndex]}.short_description`)} 
                        </Typography>
                        <Typography variant="h5">
                            {t(`hero.methods.${methodKeys[imgIndex]}.recommendation`)} 
                        </Typography>
                    </>:<>
                        <Typography variant="h5">
                            {t(`hero.methods.${methodKeys[imgIndex]}.short_description`)} 
                        </Typography>
                        <StyledButton
                            type='submit'
                            variant="contained"
                            onClick={() => authSession.openLogin()}
                            sx={{
                                width: '75%'
                            }}
                        >
                            {t('hero.methods.more_methods.sign_in')}
                        </StyledButton>
                    </>}
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
                methodName={t(`hero.methods.${methodKeys[quickPollIndex]}.title`)}
                grow={transitionStep == 4 && methodIndex != methodKeys.length-1}
            />
        </Box>
        </>
    )
}