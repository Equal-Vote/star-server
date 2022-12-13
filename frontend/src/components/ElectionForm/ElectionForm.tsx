import { useState } from "react"
import React from 'react'
import { Candidate } from "../../../../domain_model/Candidate"
// import Button from "./Button"
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
// https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
// https://web.dev/structured-clone/
import structuredClone from '@ungap/structured-clone';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Settings from "./Settings";
import Races from "./Races";
import { useSessionStorage } from "../../hooks/useSessionStorage";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { StyledButton } from '../styles';
import { Box, Paper } from "@mui/material";
import { authentication, ElectionSettings } from "../../../../domain_model/ElectionSettings";
import { Election } from "../../../../domain_model/Election";

const ElectionForm = ({ authSession, onSubmitElection, prevElectionData, submitText, disableSubmit }) => {
    // I'm referencing 4th option here
    // https://daveceddia.com/usestate-hook-examples/
    const defaultElection: Election= {
        title: '',
        election_id: '0',
        start_time: new Date(''),
        end_time: new Date(''),
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
    const [titleError, setTitleError] = useState(false)

    console.log(election)
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

    const onSubmit = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            return
        }
        e.preventDefault()

        if (!election.title) {
            setTitleError(true);
            return;
        }

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
            <Paper elevation={3} sx={{ maxWidth: 600 }} >
                <form onSubmit={onSubmit}>
                    <Grid container
                        sx={{
                            m: { xs: 0 },
                            px: { xs: 2, md: 2 },
                            py: { xs: 2 }
                        }}>
                        <Grid item xs={12}>
                            <TextField
                                error={titleError}
                                helperText={titleError ? "Election name is required" : ""}
                                id="election-name"
                                name="name"
                                // TODO: This bolding method only works for the text fields, if we like it we should figure out a way to add it to other fields as well
                                inputProps={getStyle('title')}
                                label="Election Title"
                                type="text"
                                value={election.title}
                                sx={{
                                    mx: { xs: 0, },
                                    my: { xs: 1 },
                                    boxShadow: 2,
                                }}
                                fullWidth
                                onChange={(e) => {
                                    setTitleError(false)
                                    applyElectionUpdate(election => { election.title = e.target.value })
                                }}
                            />
                        </Grid>

                        <Settings election={election} applyElectionUpdate={applyElectionUpdate} getStyle={getStyle} />
                        <Races election={election} applyElectionUpdate={applyElectionUpdate} getStyle={getStyle} />
                        <Divider light sx={{ width: '100%' }} />
                        <StyledButton
                            type='submit'
                            variant="contained"
                            disabled={disableSubmit} >
                            {submitText}
                        </StyledButton>
                    </Grid>
                </form>
            </Paper>
        </Box>
    )
}

export default ElectionForm 
