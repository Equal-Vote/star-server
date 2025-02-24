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

    const arrowSX = {transition: 'transform .2s', transform: 'scale(1.5)', '&:hover': {transform: 'scale(1.65)'}};

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

    const Carousel = () => {
        const [transitionStep, setTransitionStep] = useState(1);
        const [prevMethodIndex, setPrevMethodIndex] = useState(0);
        const [methodIndex, setMethodIndex] = useState(0);
        const timeouts = useRef([])

        const ms = 300;
        const nextMethod = (offset) => {
            let n = methodIndex + offset;
            if(n < 0 || n >= methodKeys.length) return;
            setPrevMethodIndex(methodIndex);
            setMethodIndex(n);
            // I need the gaps to be at least 17 so that we're guaranteed an animation frame 
            timeouts.current.forEach((t) => clearTimeout(t))
            setTransitionStep(0);
            timeouts.current = [
                setTimeout(() => setTransitionStep(1), ms),
            ];
        }

        let animIndex = transitionStep == 0 ? prevMethodIndex : methodIndex;

        return <Box width='90%' display='flex' flexDirection='row' justifyContent='space-between' sx={{alignItems: 'center' }}>
            <ArrowBackIosRoundedIcon sx={{...arrowSX, opacity: (methodIndex == 0? .3 : 1)}} onClick={() => nextMethod(-1)}/>
            <Box className={`${transitionStep == 0 ? 'heroFadeOut' : 'heroFadeIn'}`} 
                display='flex' gap='50px'
                sx={{
                    alignItems: 'center',
                    margin: 'auto',
                    flexDirection: {xs: 'column', md: 'row'},
                    height: {xs: '400px', md: '300px'}
                }}
            >
                <Box sx={{textAlign: {xs: 'center', md: 'left'}}}>
                    <Typography variant="h3" color={'lightShade.contrastText'}>
                        {t(`landing_page.hero.methods.${methodKeys[animIndex]}.title`)} 
                    </Typography>
                    {animIndex != methodKeys.length-1 && <Typography variant="h5" color={'lightShade.contrastText'}>
                        {t(`landing_page.hero.methods.${methodKeys[animIndex]}.recommendation`)} 
                    </Typography>}
                </Box>
                <Box
                >
                    {animIndex != methodKeys.length-1 ? <>
                        <Box className="heroBallot" sx={{width: {xs: '100%', md:'100%'}, maxWidth: '450px', margin: 'auto'}}>
                            {animIndex == 0 && <BallotContext.Provider value={makeBallotContext(starScores, setStarScores, 'STAR')}>
                                <StarBallotView onlyGrid={true}/>
                            </BallotContext.Provider>}
                            {animIndex == 1 && <BallotContext.Provider value={makeBallotContext(approvalScores, setApprovalScores, 'Approval')}>
                                <ApprovalBallotView onlyGrid={true}/>
                            </BallotContext.Provider>}
                            {animIndex == 2 && <BallotContext.Provider value={makeBallotContext(rrRanks, setRrRanks, 'RankedRobin')}>
                                <RankedBallotView onlyGrid={true}/>
                            </BallotContext.Provider>}
                        </Box>
                    </>:<Box sx={{maxWidth: '450px', margin: 'auto'}}>
                        <Typography color={'lightShade.contrastText'}>
                            {t(`landing_page.hero.methods.more_methods.${
                                authSession.isLoggedIn()? 'full_editor_description' : 'sign_in_description'
                            }`)}.
                        </Typography>
                        <br/>
                        {authSession.isLoggedIn() &&
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
                                Use Full Editor
                            </Button>
                        }
                        {!authSession.isLoggedIn() &&
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
                        }
                    </Box>}
                </Box>
            </Box>
            <ArrowForwardIosRoundedIcon sx={{...arrowSX, opacity: (methodIndex == methodKeys.length-1? .3 : 1)}} onClick={() => nextMethod(1)}/>
        </Box>
    }

    return (
            <Box display='flex' flexDirection='column' sx={{
                margin: 'auto',
                maxWidth: '1500px',
                p: { xs: 2, md: 2 },
                alignItems: 'center',
                textAlign: 'center',
            }}>
                <Typography variant="h4" color={'lightShade.contrastText'}> {t('landing_page.hero.title')} </Typography>
                <Carousel/>
            </Box>
    )
}