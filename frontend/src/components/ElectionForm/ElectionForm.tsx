import { useState, useEffect, useRef } from "react"
import React from 'react'
import Grid from "@mui/material/Grid";
import structuredClone from '@ungap/structured-clone';
// import Settings from "./Settings";
import Races from "./Races";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { Box, Paper, Fade } from "@mui/material";
import { Election } from "../../../../domain_model/Election";
import ElectionDetails from "./ElectionDetails";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { CardActionArea } from "@mui/material";
import Typography from '@mui/material/Typography';
import { StyledButton } from '../styles';

type Pages = 'ElectionDetails' | 'RaceDetails' | 'Open?' | 'Limit?' | 'VoterList?' | 'Emails?' | 'Invitations?' | 'Login?' | 'Register?' | 'CustomRegister?' |
    'Scenario1' | 'Scenario2' | 'Scenario3' | 'Scenario4' | 'Scenario5' | 'Scenario6' | 'Scenario7' | 'Scenario8' | 'Scenario9' | 'PublicResults?' | 'Save'

type QuestionProps = {
    Enable: boolean,
    Question: string,
    HelpText?: string,
    Option1?: AnswerProps,
    Option2?: AnswerProps,
    onNext?: Function,
    BackPage?: Pages,
    election?: Election,
    applyElectionUpdate?: Function,
    setPage: Function
}

type AnswerProps = {
    Answer: string,
    HelpText?: string,
    GotoPage: Pages,
    election?: Election,
    onSelect?: Function,
    setPage: Function
}

function Question({ Enable, Question, HelpText, Option1, Option2, onNext, BackPage, election, applyElectionUpdate, setPage }: QuestionProps) {
    // blocks back button and calls onBack function instead
    useEffect(() => {
        if (Enable) {
            window.history.pushState(null, null, window.location.href);
            window.onpopstate = () => {
                setPage(BackPage)
            }
        }
    }, [Enable]);

    return (
        // Fade in animation, if Enable == false component won't be rendered
        <Fade in={Enable} mountOnEnter unmountOnExit timeout={{ appear: 500, enter: 500, exit: 0 }}>
            <div>
                <Grid container
                    sx={{
                        m: 0,
                        p: 1,
                    }}
                >
                    <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                        <Typography align='center' variant="h4" component="h4">
                            {Question}
                        </Typography>
                        <Typography align='center' variant="body1">
                            {HelpText}
                        </Typography>
                    </Grid>
                    {Option1 &&
                        <Grid item xs={12} md={6} sx={{ m: 0, p: 1 }}>
                            <Card elevation={4} >
                                <CardActionArea onClick={() => {
                                    if (Option1.onSelect) {
                                        Option1.onSelect()
                                    }
                                    setPage(Option1.GotoPage)
                                }}>
                                    <CardContent sx={{ height: 200 }} >
                                        <Typography align='center' gutterBottom variant="h4" component="h4">
                                            {Option1.Answer}
                                        </Typography>
                                        <Typography align='left' gutterBottom variant='body2'>
                                            {Option1.HelpText}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>}
                    {Option2 &&
                        <Grid item xs={12} md={6} sx={{ m: 0, p: 1 }}>
                            <Card elevation={4}  >
                                <CardActionArea onClick={() => {
                                    if (Option2.onSelect) {
                                        Option2.onSelect()
                                    }
                                    setPage(Option2.GotoPage)
                                }}>
                                    <CardContent sx={{ height: 200 }}>
                                        <Typography align='center' gutterBottom variant="h4" component="h4">
                                            {Option2.Answer}
                                        </Typography>
                                        <Typography align='left' gutterBottom variant='body2'>
                                            {Option2.HelpText}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>}
                    <Grid item xs={3} sx={{ m: 0, p: 1, pt: 2 }}>
                        <StyledButton
                            type='button'
                            variant="contained"
                            width="100%"
                            onClick={() => {
                                setPage(BackPage)
                            }
                            }>
                            Back
                        </StyledButton>
                    </Grid>
                    <Grid item xs={6}></Grid>
                    {onNext &&
                        <Grid item xs={3} sx={{ m: 0, p: 1, pt: 2 }}>
                            <StyledButton
                                type='button'
                                variant="contained"
                                width="100%"
                                onClick={() => {
                                    onNext()
                                }
                                }>
                                Next
                            </StyledButton>
                        </Grid>}

                </Grid>
            </div>
        </Fade>
    )
}

const ElectionForm = ({ authSession, onSubmitElection, prevElectionData, submitText, disableSubmit }) => {
    // I'm referencing 4th option here
    // https://daveceddia.com/usestate-hook-examples/
    const defaultElection: Election = {
        title: '',
        election_id: '0',
        description: '',
        state: 'draft',
        frontend_url: '',
        owner_id: '',
        races: [
            {
                race_id: '0',
                title: '',
                description: '',
                num_winners: 1,
                voting_method: 'STAR',
                candidates: [
                    {
                        candidate_id: '0',
                        candidate_name: '',
                    },
                    {
                        candidate_id: '1',
                        candidate_name: '',
                    },
                    {
                        candidate_id: '2',
                        candidate_name: '',
                    }
                ],
                precincts: undefined,
            }
        ],
        settings: {
            voter_access: 'open',
            voter_authentication: {
                ip_address: true,
            },
            ballot_updates: false,
            public_results: true,
        }
    }
    if (prevElectionData == null) {
        prevElectionData = defaultElection
    }

    const [election, setElectionData] = useLocalStorage('Election', prevElectionData)
    useEffect(() => {
        prevElectionData.races.forEach((race) => {
            race.candidates.push({
                candidate_id: String(race.candidates.length),
                candidate_name: '',
            })
        })
        setElectionData(prevElectionData)
    }, [])

    const [page, setPage] = useState('ElectionDetails' as Pages)
    const [selectedScenario, setSelectedScenario] = useState('Scenario1' as Pages)

    const applyElectionUpdate = (updateFunc) => {
        const electionCopy = structuredClone(election)
        updateFunc(electionCopy)
        setElectionData(electionCopy)
    };

    const getStyle = (...keys) => {
        var cur = election;
        var prev = prevElectionData;
        keys.forEach(key => {
            cur = cur[key]
            prev = prev[key]
        })
        return { style: { fontWeight: (cur == prev) ? 'normal' : 'bold' } }
    }

    const onSubmit = () => {
        // This assigns only the new fields, but otherwise keeps the existing election fields

        const newElection = structuredClone(election)
        newElection.frontend_url = ''
        newElection.owner_id = authSession.getIdField('sub')
        newElection.state = 'draft'

        if (newElection.races.length === 1) {
            // If only one race, use main eleciton title and description
            newElection.races[0].title = newElection.title
            newElection.races[0].description = newElection.description
        }

        //Iterates through races and removes candidates without a name listed
        newElection.races.forEach((race, index) => {
            const newCandidates = []
            newElection.races[index].candidates.forEach(candidate => {
                if (candidate.candidate_name !== '') {
                    newCandidates.push(candidate)
                }
            });
            newElection.races[index].candidates = newCandidates
        })

        try {
            onSubmitElection(newElection)
        } catch (error) {
            console.log(error)
        }
    }

    const containerRef = useRef(null);

    return (
        <Box
            display='flex'
            justifyContent="center"
            alignItems="center"
            sx={{
                my: 2,
                mx: { xs: 0 },
                display: 'flex',
                flexWrap: 'wrap',
            }}>
            <Paper elevation={3} sx={{ maxWidth: 600 }} ref={containerRef}>
                <form id={'electionForm'} onSubmit={(e) => e.preventDefault()}>
                    <Fade in={page === 'ElectionDetails'} mountOnEnter unmountOnExit timeout={{ appear: 500, enter: 500, exit: 0 }}>
                        <div>
                            <ElectionDetails election={election} applyElectionUpdate={applyElectionUpdate} getStyle={getStyle} onBack={() => setPage('ElectionDetails')} onNext={() => setPage('RaceDetails')} />
                        </div>
                    </Fade>
                    <Fade in={page === 'RaceDetails'} mountOnEnter unmountOnExit timeout={{ appear: 500, enter: 500, exit: 0 }}>
                        <div>
                            <Races election={election} applyElectionUpdate={applyElectionUpdate} getStyle={getStyle} onBack={() => setPage('ElectionDetails')} onNext={() => setPage('Open?')} />
                        </div>
                    </Fade>
                    <Question
                        Enable={page === 'Open?'}
                        Question='Will this election be open to anyone?'
                        HelpText=''
                        Option1={{
                            Answer: 'Yes',
                            HelpText: 'For quick polls or demos',
                            GotoPage: 'Limit?',
                            election: election,
                            setPage: setPage,
                        }}
                        Option2={{
                            Answer: 'No',
                            HelpText: 'For when you want some restrictions on who can vote',
                            GotoPage: 'VoterList?',
                            election: election,
                            setPage: setPage,
                        }}
                        BackPage='RaceDetails'
                        setPage={setPage}
                    />
                    <Question
                        Enable={page === 'Limit?'}
                        Question='Do you want to limit to one vote per person?'
                        HelpText=''
                        Option1={{
                            Answer: 'Yes',
                            HelpText: 'For most polls',
                            GotoPage: 'Scenario1',
                            election: election,
                            setPage: setPage,
                        }}
                        Option2={{
                            Answer: 'No',
                            HelpText: 'For when you want to vote multiple times on one device, demos, tabling, etc.',
                            GotoPage: 'Scenario2',
                            election: election,
                            setPage: setPage,
                        }}
                        BackPage='Open?'
                        setPage={setPage}
                    />
                    <Question
                        Enable={page === 'VoterList?'}
                        Question='Do you already have a voter list?'
                        HelpText=''
                        Option1={{
                            Answer: 'Yes',
                            HelpText: '',
                            GotoPage: 'Emails?',
                            election: election,
                            setPage: setPage,
                        }}
                        Option2={{
                            Answer: 'No',
                            HelpText: '',
                            GotoPage: 'Register?',
                            election: election,
                            setPage: setPage,
                        }}
                        BackPage='Open?'
                        setPage={setPage}
                    />

                    <Question
                        Enable={page === 'Emails?'}
                        Question='Will you provide a list of emails or voter IDs?'
                        HelpText=''
                        Option1={{
                            Answer: 'Emails',
                            HelpText: '',
                            GotoPage: 'Invitations?',
                            election: election,
                            setPage: setPage,
                        }}
                        Option2={{
                            Answer: 'Voter IDs',
                            HelpText: 'A unique ID for each of your voters',
                            GotoPage: 'Scenario6',
                            election: election,
                            setPage: setPage,
                        }}
                        BackPage='VoterList?'
                        setPage={setPage}
                    />

                    <Question
                        Enable={page === 'Invitations?'}
                        Question='Do you want us to send email invitations?'
                        HelpText=''
                        Option1={{
                            Answer: 'Yes',
                            HelpText: 'Email invitations sent after election is finalized',
                            GotoPage: 'Login?',
                            election: election,
                            setPage: setPage,
                        }}
                        Option2={{
                            Answer: 'No',
                            HelpText: '',
                            GotoPage: 'Scenario5',
                            election: election,
                            setPage: setPage,
                        }}
                        BackPage='Emails?'
                        setPage={setPage}
                    />

                    <Question
                        Enable={page === 'Login?'}
                        Question='Do you want your voters to also register and log in with star.vote?'
                        HelpText=''
                        Option1={{
                            Answer: 'Yes',
                            HelpText: 'Voters will create an account and verify their email adress.',
                            GotoPage: 'Scenario3',
                            election: election,
                            setPage: setPage,
                        }}
                        Option2={{
                            Answer: 'No',
                            HelpText: 'Voters will be given a unique link that will allow them to vote.',
                            GotoPage: 'Scenario4',
                            election: election,
                            setPage: setPage,
                        }}
                        BackPage='Invitations?'
                        setPage={setPage}
                    />
                    <Question
                        Enable={page === 'Register?'}
                        Question='Would you like to require voters to register with star.vote to vote?'
                        HelpText=''
                        Option1={{
                            Answer: 'Yes',
                            HelpText: 'Voters will create an account and verify their email adress.',
                            GotoPage: 'CustomRegister?',
                            election: election,
                            setPage: setPage,
                        }}
                        Option2={{
                            Answer: 'No',
                            HelpText: '',
                            GotoPage: 'Scenario9',
                            election: election,
                            setPage: setPage,
                        }}
                        BackPage='VoterList?'
                        setPage={setPage}
                    />

                    <Question
                        Enable={page === 'CustomRegister?'}
                        Question='Would you like to add additional custom registration?'
                        HelpText=''
                        Option1={{
                            Answer: 'Yes',
                            HelpText: '',
                            GotoPage: 'Scenario7',
                            election: election,
                            setPage: setPage,
                        }}
                        Option2={{
                            Answer: 'No',
                            HelpText: '',
                            GotoPage: 'Scenario8',
                            election: election,
                            setPage: setPage,
                        }}
                        BackPage='Register?'
                        setPage={setPage}
                    />
                    <Question
                        Enable={page === 'Scenario1'}
                        Question="Ok, we'll limit voters to one vote per person."
                        HelpText=''
                        onNext={() => {
                            applyElectionUpdate((election: Election) => {
                                election.settings.voter_access = 'open'
                                election.settings.voter_authentication.voter_id = false
                                election.settings.voter_authentication.email = false
                                election.settings.voter_authentication.ip_address = true
                                election.settings.invitation = undefined
                            })
                            setSelectedScenario('Scenario1')
                            setPage('PublicResults?')
                        }}
                        BackPage='Limit?'
                        setPage={setPage}
                    />

                    <Question
                        Enable={page === 'Scenario2'}
                        Question="Ok, voters will be able to vote as many times as they want."
                        HelpText=''
                        onNext={() => {
                            applyElectionUpdate((election: Election) => {
                                election.settings.voter_access = 'open'
                                election.settings.voter_authentication.voter_id = false
                                election.settings.voter_authentication.email = false
                                election.settings.voter_authentication.ip_address = false
                                election.settings.invitation = undefined
                            })
                            setSelectedScenario('Scenario2')
                            setPage('PublicResults?')
                        }}
                        BackPage='Limit?'
                        setPage={setPage}
                    />

                    <Question
                        Enable={page === 'Scenario3'}
                        Question="Ok, emails will be sent to your voters inviting them to create a star.vote account and vote in your election."
                        HelpText=''
                        onNext={() => {
                            applyElectionUpdate((election: Election) => {
                                election.settings.voter_access = 'closed'
                                election.settings.voter_authentication.voter_id = false
                                election.settings.voter_authentication.email = true
                                election.settings.voter_authentication.ip_address = false
                                election.settings.invitation = 'email'
                            })
                            setSelectedScenario('Scenario3')
                            setPage('PublicResults?')
                        }}
                        BackPage='Login?'
                        setPage={setPage}
                    />

                    <Question
                        Enable={page === 'Scenario4'}
                        Question="Ok, unique emails will be sent to your voters containing their voter ID inviting them to vote in your election. They will not be required to create a star.vote account."
                        HelpText=''
                        onNext={() => {
                            applyElectionUpdate((election: Election) => {
                                election.settings.voter_access = 'closed'
                                election.settings.voter_authentication.voter_id = true
                                election.settings.voter_authentication.email = false
                                election.settings.voter_authentication.ip_address = false
                                election.settings.invitation = 'email'
                            })
                            setSelectedScenario('Scenario4')
                            setPage('PublicResults?')
                        }}
                        BackPage='Login?'
                        setPage={setPage}
                    />

                    <Question
                        Enable={page === 'Scenario5'}
                        Question="Ok, voters will not be sent an invitation and will need to create a star.vote account to verify their email address and access your election."
                        HelpText=''
                        onNext={() => {
                            applyElectionUpdate((election: Election) => {
                                election.settings.voter_access = 'closed'
                                election.settings.voter_authentication.voter_id = false
                                election.settings.voter_authentication.email = true
                                election.settings.voter_authentication.ip_address = false
                                election.settings.invitation = undefined
                            })
                            setSelectedScenario('Scenario5')
                            setPage('PublicResults?')
                        }}
                        BackPage='Invitations?'
                        setPage={setPage}
                    />

                    <Question
                        Enable={page === 'Scenario6'}
                        Question="Ok, you will need to provide voters their voter id which they will enter in order to vote."
                        HelpText=''
                        onNext={() => {
                            applyElectionUpdate((election: Election) => {
                                election.settings.voter_access = 'closed'
                                election.settings.voter_authentication.voter_id = true
                                election.settings.voter_authentication.email = false
                                election.settings.voter_authentication.ip_address = false
                                election.settings.invitation = undefined
                            })
                            setSelectedScenario('Scenario6')
                            setPage('PublicResults?')
                        }}
                        BackPage='Emails?'
                        setPage={setPage}
                    />

                    <Question
                        Enable={page === 'Scenario7'}
                        Question="Ok, voters will register with star.vote and provide the additional registration information you request in order to submit a provisional ballot. Your or a credentialer you specify will need to review and approve their registration."
                        HelpText=''
                        onNext={() => {
                            applyElectionUpdate((election: Election) => {
                                election.settings.voter_access = 'registration'
                                election.settings.voter_authentication.voter_id = false
                                election.settings.voter_authentication.email = true
                                election.settings.voter_authentication.ip_address = false
                                election.settings.invitation = undefined
                            })
                            setSelectedScenario('Scenario7')
                            setPage('PublicResults?')
                        }}
                        BackPage='CustomRegister?'
                        setPage={setPage}
                    />

                    <Question
                        Enable={page === 'Scenario8'}
                        Question="Ok, voters will register with star.vote in order to vote."
                        HelpText=''
                        onNext={() => {
                            applyElectionUpdate((election: Election) => {
                                election.settings.voter_access = 'open'
                                election.settings.voter_authentication.voter_id = false
                                election.settings.voter_authentication.email = true
                                election.settings.voter_authentication.ip_address = false
                                election.settings.invitation = undefined
                            })
                            setSelectedScenario('Scenario8')
                            setPage('PublicResults?')
                        }}
                        BackPage='CustomRegister?'
                        setPage={setPage}
                    />

                    <Question
                        Enable={page === 'Scenario9'}
                        Question="Ok, voters won't need to log in in order to vote."
                        HelpText=''
                        onNext={() => {
                            applyElectionUpdate((election: Election) => {
                                election.settings.voter_access = 'open'
                                election.settings.voter_authentication.voter_id = false
                                election.settings.voter_authentication.email = false
                                election.settings.voter_authentication.ip_address = true
                                election.settings.invitation = undefined
                            })
                            setSelectedScenario('Scenario9')
                            setPage('PublicResults?')
                        }}
                        BackPage='Register?'
                        setPage={setPage}
                    />

                    <Question
                        Enable={page === 'PublicResults?'}
                        Question="Do you want results to be public?"
                        HelpText=''
                        Option1={{
                            Answer: 'Yes',
                            HelpText: 'Allow voters to view preliminary results.',
                            GotoPage: 'Save',
                            election: election,
                            setPage: setPage,
                            onSelect: () => {
                                applyElectionUpdate((election: Election) => {
                                    election.settings.public_results = true
                                })
                            }
                        }}
                        Option2={{
                            Answer: 'No',
                            HelpText: 'Administrators can make results public at any time.',
                            GotoPage: 'Save',
                            election: election,
                            setPage: setPage,
                            onSelect: () => {
                                applyElectionUpdate((election: Election) => {
                                    election.settings.public_results = false
                                })
                            }
                        }}
                        BackPage={selectedScenario}
                        setPage={setPage}
                    />
                    <Fade in={page === 'Save'} mountOnEnter unmountOnExit timeout={{ appear: 500, enter: 500, exit: 0 }}>
                        <div>
                            <Grid container
                                sx={{
                                    m: 0,
                                    p: 1,
                                }}
                            >
                                <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                                    <Typography align='center' variant="h4" component="h4">
                                        Save
                                    </Typography>
                                    <Typography align='center' variant="body1">
                                        some text about saving, maybe overview of their election
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                                    <StyledButton
                                        type='button'
                                        variant="contained"
                                        onClick={() => {
                                            onSubmit()
                                        }
                                        }>
                                        {submitText}
                                    </StyledButton>
                                </Grid>
                            </Grid>
                        </div>
                    </Fade>
                </form>
            </Paper>
        </Box>
    )
}

export default ElectionForm 
