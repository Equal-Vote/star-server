import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useNavigate } from 'react-router'
import { BallotContext } from './Election/Voting/VotePage';
import {Typography, Stack, Button, Dialog, Box} from '@mui/material';

const ClassicPrompt = () => {
    const navigate = useNavigate()

    const [prevClassicPrompt, setPrevClassicPrompt] = useLocalStorage('prev_classic_prompt', '')

    function goToOriginal(){
        setPrevClassicPrompt('classic')

        window.location.href = 'https://www.classic.star.vote';
    }

    function goToNewVersion(){
        setPrevClassicPrompt('new_version')
    }

    if(prevClassicPrompt != '') return <></> // save on rendering time so the redirect is faster

    return (
        <>
            <Box className="classicPageWrapper">
                <iframe src='/classic_star_vote.html' style={{width: '100%', height: '100%'}} scrolling="no"></iframe>
            </Box>
            <Dialog open={true} className="classicPopupBkg" keepMounted>
                <Stack className="classicPopupInner">
                    <Typography align='center' component='h4'>
                        The original star.vote has been moved to classic.star.vote, but the new and improved version is live!
                    </Typography>
                    <br/>
                    <Typography align='center' component='h4'>
                        Want to try new version?
                    </Typography>
                    <br/>
                    <Button
                        variant="contained"
                        sx={{
                            width: '80%',
                            m: 'auto',
                            p: 1,
                            boxShadow: 2,
                            backgroundColor: 'primary.main',
                            fontWeight: 'bold',
                            fontSize: 18,
                        }}
                        onClick={goToNewVersion}
                    >
                        Try the New Version!
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{
                            width: '70%',
                            m: 'auto',
                            mt: 2,
                            p: 1,
                            boxShadow: 2,
                            fontWeight: 'bold',
                            fontSize: 18,
                        }}
                        onClick={goToNewVersion}
                    >
                        Return to Classic
                    </Button>
                </Stack>
            </Dialog>
        </>
    )
}

export default ClassicPrompt
