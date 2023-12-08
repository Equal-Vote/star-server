import React from 'react'
import { useNavigate } from "react-router"
import { Election } from '../../../../domain_model/Election';
import { usePostElection } from '../../hooks/useAPI';
import { DateTime } from 'luxon'
import { Card, CardActionArea, CardMedia, CardContent, Typography, Box, Grid } from '@mui/material';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import useAuthSession from '../AuthSessionContextProvider';
import { useThemeSelector } from '../../theme';

const CreateElectionTemplates = () => {
    const authSession = useAuthSession()
    const themeSelector = useThemeSelector()
    const navigate = useNavigate()
    const { error, isPending, makeRequest: postElection } = usePostElection()
    const [quickPoll, setQuickPoll] = useLocalStorage<Election>('QuickPoll', null)
    const cardColor = themeSelector.mode === 'darkMode' ? 'brand.gray5' : 'brand.gray1'
    const defaultElection: Election = {
        title: '',
        election_id: '0',
        description: '',
        state: 'draft',
        frontend_url: '',
        owner_id: '',
        races: [],
        settings: {
            voter_access: 'open',
            voter_authentication: {
                ip_address: true,
            },
            ballot_updates: false,
            public_results: true,
            time_zone: DateTime.now().zone.name,
            random_candidate_order: true,
            require_instruction_confirmation: true,
        }
    }

    const onAddElection = async (updateFunc: (election: Election) => any) => {
        const election = defaultElection
        updateFunc(election)
        // calls post election api, throws error if response not ok
        election.frontend_url = ''
        election.owner_id = authSession.getIdField('sub')
        election.state = 'draft'
        if (quickPoll) {
            // If quick poll exists grab the title from it, if quick poll not filled in will just be empty string
            election.title = quickPoll.title
            // Grab candidates from quick poll that have a candidate name filled out
            let candidates = quickPoll.races[0].candidates.filter(candidate => candidate.candidate_name.length > 0)
            if (candidates.length > 0) {
                // Set the race to use the same title as the quick poll so it's easy to identify, add candidates 
                election.races = quickPoll.races
                election.races[0].title = quickPoll.title
                election.races[0].candidates = candidates
            }

        }

        const newElection = await postElection(
            {
                Election: election,
            })
        if ((!newElection)) {
            throw Error("Error submitting election");
        }
        setQuickPoll(null)
        navigate(`/Election/${newElection.election.election_id}/admin`)
    }
    const cardHeight = 220
    return (
        < >
            {!authSession.isLoggedIn() && <div> Must be logged in to create elections </div>}
            {authSession.isLoggedIn() &&
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    margin={10}>
                    <Grid container spacing={3} maxWidth={1000}>
                        <Grid item xs={12} sm={6} md={3}>

                            <Card sx={{ backgroundColor: cardColor, minHeight: cardHeight }}>
                                <CardActionArea
                                    onClick={() => onAddElection(election => {
                                        election.settings.voter_access = 'open'
                                        election.settings.voter_authentication.voter_id = false
                                        election.settings.voter_authentication.email = false
                                        election.settings.voter_authentication.ip_address = false
                                        election.settings.invitation = undefined
                                    })}>
                                    <CardContent>
                                        <Typography gutterBottom variant="h6">
                                            Open Access, No Vote Limit
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Useful for demonstrations
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ backgroundColor: cardColor, minHeight: cardHeight }}>
                                <CardActionArea
                                    onClick={() => onAddElection(election => {
                                        election.settings.voter_access = 'open'
                                        election.settings.voter_authentication.voter_id = false
                                        election.settings.voter_authentication.email = false
                                        election.settings.voter_authentication.ip_address = true
                                        election.settings.invitation = undefined
                                    })}>
                                    <CardContent>
                                        <Typography gutterBottom variant="h6">
                                            Open Access, One Vote Per Person
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            For Quick Polls
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ backgroundColor: cardColor, minHeight: cardHeight }}>
                                <CardActionArea
                                    onClick={() => onAddElection(election => {
                                        election.settings.voter_access = 'open'
                                        election.settings.voter_authentication.voter_id = false
                                        election.settings.voter_authentication.email = true
                                        election.settings.voter_authentication.ip_address = false
                                        election.settings.invitation = undefined
                                    })}>
                                    <CardContent>
                                        <Typography gutterBottom variant="h6">
                                            Open Access, Login Required
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Open to all voters that create a star.vote account
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ backgroundColor: cardColor, minHeight: cardHeight }}>
                                <CardActionArea
                                    onClick={() => onAddElection(election => {
                                        election.settings.voter_access = 'registration'
                                        election.settings.voter_authentication.voter_id = false
                                        election.settings.voter_authentication.email = true
                                        election.settings.voter_authentication.ip_address = false
                                        election.settings.invitation = undefined
                                    })}>
                                    <CardContent>
                                        <Typography gutterBottom variant="h6">
                                            Open Access With Custom Registration
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Voters must register and be approved by election admins
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ backgroundColor: cardColor, minHeight: cardHeight }}>
                                <CardActionArea
                                    onClick={() => onAddElection(election => {
                                        election.settings.voter_access = 'closed'
                                        election.settings.voter_authentication.voter_id = true
                                        election.settings.voter_authentication.email = false
                                        election.settings.voter_authentication.ip_address = false
                                        election.settings.invitation = 'email'
                                    })}>
                                    <CardContent>
                                        <Typography gutterBottom variant="h6">
                                            Closed voter list with unique email invites
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Voters receive unique email invitations, no log in required
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ backgroundColor: cardColor, minHeight: cardHeight }}>
                                <CardActionArea
                                    onClick={() => onAddElection(election => {
                                        election.settings.voter_access = 'closed'
                                        election.settings.voter_authentication.voter_id = false
                                        election.settings.voter_authentication.email = true
                                        election.settings.voter_authentication.ip_address = false
                                        election.settings.invitation = 'email'
                                    })}>
                                    <CardContent>
                                        <Typography gutterBottom variant="h6">
                                            Closed voter list with login required
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Voters receive email invitations but must create star.vote account in order to vote
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ backgroundColor: cardColor, minHeight: cardHeight }}>
                                <CardActionArea
                                    onClick={() => onAddElection(election => {
                                        election.settings.voter_access = 'closed'
                                        election.settings.voter_authentication.voter_id = true
                                        election.settings.voter_authentication.email = false
                                        election.settings.voter_authentication.ip_address = false
                                        election.settings.invitation = undefined
                                    })}>
                                    <CardContent>
                                        <Typography gutterBottom variant="h6">
                                            Closed voter id list with voter-IDs
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Election provide list of valid voter IDs and distribute them to voters
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            }
            {isPending && <div> Submitting... </div>}
        </>
    )
}

export default CreateElectionTemplates
