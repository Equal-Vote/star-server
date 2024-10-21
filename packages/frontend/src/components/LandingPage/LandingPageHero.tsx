import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import React, { useContext, useRef, useState } from 'react'
import QuickPoll from '../ElectionForm/QuickPoll'
import useAuthSession from '../AuthSessionContextProvider'
import { useThemeSelector } from '../../theme'
import useFeatureFlags from '../FeatureFlagContextProvider'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import { StyledButton, Tip } from '../styles'
import { BallotContext, IBallotContext } from '../Election/Voting/VotePage'
import StarBallotView from '../Election/Voting/StarBallotView'
import { ElectionContextProvider } from '../ElectionContextProvider'
import { VotingMethod } from '@equal-vote/star-vote-shared/domain_model/Race'
import ApprovalBallotView from '../Election/Voting/ApprovalBallotView'
import RankedBallotView from '../Election/Voting/RankedBallotView'
import { useSubstitutedTranslation } from '../util'
import { useTranslation } from 'react-i18next'
import { CreateElectionContext } from '../ElectionForm/CreateElectionDialog'
import { Button } from '@mui/material'
import { max } from 'date-fns'

export default ({}) => {
    const authSession = useAuthSession();
    const themeSelector = useThemeSelector();
    const flags = useFeatureFlags();
    
    const createElectionContext = useContext(CreateElectionContext);
    
    const [transitionStep, setTransitionStep] = useState(10000);
    const [prevMethodIndex, setPrevMethodIndex] = useState(0);
    const [methodIndex, setMethodIndex] = useState(0);
    const timeouts = useRef([])

    const {t} = useSubstitutedTranslation('election');

    const [starScores, setStarScores] = useState(t('landing_page.hero.methods.star.default_scores'));
    const [approvalScores, setApprovalScores] = useState(t('landing_page.hero.methods.approval.default_scores'));
    const [rrRanks, setRrRanks] = useState(t('landing_page.hero.methods.ranked_robin.default_ranks'));

    // selected to be consistent with the Race.ts domain_model

    const methodKeys = [
        'star',
        'approval',
        'ranked_robin',
        'more_methods'
    ]

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

    const makeBallotContext = (scores, onUpdate, voting_method: VotingMethod):IBallotContext  => {
        const candidateNames = t('landing_page.hero.candidates')
        return {
            instructionsRead: true,
            setInstructionsRead: () => {},
            candidates: 
                scores.map((score, i) => 
                    ({
                        'candidate_id': '',
                        'candidate_name': String(candidateNames[i]),
                        'score': Number(score) ?? 0,
                    })
                ),
            // this isn't used, it's just included to make typescript happy
            race: {
                "title": "",
                "race_id": "",
                "num_winners": 1,
                "voting_method": voting_method,
                "candidates": []
            },
            receiptEmail: {
                sendReceipt: false,
                email: ''
            },
            setReceiptEmail: () => {},
            onUpdate: onUpdate,
            maxRankings: undefined,
        }
    }

    return (
        <Box display='flex' flexDirection='row' justifyContent='center' flexWrap='wrap' sx={{
            margin: 'auto',
            gap: {s: 6, md: 20}, 
            maxWidth: '1500px',
            p: { xs: 2, md: 2 }
        }}>
            <Box display='flex' flexDirection='column' sx={{
                alignItems: 'center',
                textAlign: 'center',
            }}>
                <Typography variant="h4" color={'lightShade.contrastText'}> {t('landing_page.hero.title')} </Typography>
                <Box width='90%' display='flex' flexDirection='row' justifyContent='space-between' sx={{alignItems: 'center', paddingBottom: 3}}>
                    <ArrowBackIosRoundedIcon sx={{...arrowSX, opacity: (methodIndex == 0? 0 : 1)}} onClick={() => nextMethod(-1)}/>
                    <Box display='flex' flexDirection='row' className={transitionStep==0? 'heroGrow' : 'heroShrink'} sx={{alignItems: 'center'}}>
                        <Typography variant="h3" color={'lightShade.contrastText'}>
                            {t(`landing_page.hero.methods.${methodKeys[methodIndex]}.title`)} 
                        </Typography>
                    </Box>
                    <ArrowForwardIosRoundedIcon sx={{...arrowSX, opacity: (methodIndex == methodKeys.length-1? 0 : 1)}} onClick={() => nextMethod(1)}/>
                </Box>

                <Box
                    className={transitionStep==2? 'heroGrow' : 'heroShrink'} 
                    sx={{width: '100%'}}
                >
                    {imgIndex != methodKeys.length-1 ? <>
                        <Box className="heroBallot" sx={{width: {xs: '100%', md:'80%'}, maxWidth: '450px', margin: 'auto'}}>
                            {imgIndex == 0 && <BallotContext.Provider value={makeBallotContext(starScores, setStarScores, 'STAR')}>
                                <StarBallotView onlyGrid={true}/>
                            </BallotContext.Provider>}
                            {imgIndex == 1 && <BallotContext.Provider value={makeBallotContext(approvalScores, setApprovalScores, 'Approval')}>
                                <ApprovalBallotView onlyGrid={true}/>
                            </BallotContext.Provider>}
                            {imgIndex == 2 && <BallotContext.Provider value={makeBallotContext(rrRanks, setRrRanks, 'RankedRobin')}>
                                <RankedBallotView onlyGrid={true}/>
                            </BallotContext.Provider>}
                        </Box>
                        <Typography variant="h5" color={'lightShade.contrastText'}>
                            {t(`landing_page.hero.methods.${methodKeys[imgIndex]}.recommendation`)} 
                        </Typography>
                    </>:<>
                        {authSession.isLoggedIn() ?
                            <Button
                                variant="outlined"
                                onClick={() => createElectionContext.openDialog()}
                                sx={{
                                    width: '90%',
                                    p: 1,
                                    m: 'auto',
                                    boxShadow: 2,
                                    fontWeight: 'bold',
                                    fontSize: 16,
                                }}
                            >
                            {t('landing_page.quick_poll.continue_with_editor')}
                        </Button>
                        : <>
                        <Typography variant="h5" color={'lightShade.contrastText'}>
                            {t(`landing_page.hero.methods.${methodKeys[imgIndex]}.short_description`)} 
                        </Typography>
                        <StyledButton
                            type='submit'
                            variant="contained"
                            onClick={() => authSession.openLogin()}
                            sx={{
                                width: '75%'
                            }}
                        >
                            {t('landing_page.hero.methods.more_methods.sign_in')}
                        </StyledButton>
                        </>}
                    </>}
                </Box>
            </Box>
            <QuickPoll
                authSession={authSession}
                methodName={t(`methods.${methodKeys[quickPollIndex]}.full_name`)}
                methodKey={methodKeys[quickPollIndex]}
                grow={transitionStep == 4 && methodIndex != methodKeys.length-1}
            />
        </Box>
    )
}