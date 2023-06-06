import React, { useState } from 'react'
import useFetch from '../../hooks/useFetch';
import Container from '@mui/material/Container';
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router"
import structuredClone from '@ungap/structured-clone';
import { StyledButton, StyledTextField } from '../styles.js'
import { Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCookie } from '../../hooks/useCookie';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import Typography from '@mui/material/Typography';

const QuickPoll = ({ authSession }) => {
    const [tempID, setTempID] = useCookie('temp_id', '0')
    const navigate = useNavigate()
    const { error, isPending, makeRequest: postElection } = useFetch('/API/Elections', 'post')
    const onSubmitElection = async (election) => {
        // calls post election api, throws error if response not ok
        const newElection = await postElection(
            {
                Election: election,
            })
        if ((!newElection)) {
            throw Error("Error submitting election");
        }
        localStorage.removeItem('Election')
        navigate(`/Election/${newElection.election.election_id}`)
    }

    const QuickPollTemplate = {
        title: '',
        election_id: '0',
        races: [
            {
                race_id: '0',
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


    const [election, setElectionData] = useLocalStorage('Election', QuickPollTemplate)
    const [titleError, setTitleError] = useState(false)

    const applyElectionUpdate = (updateFunc) => {
        const electionCopy = structuredClone(election)
        updateFunc(electionCopy)
        setElectionData(electionCopy)
    };

    const onSubmit = (e) => {
        e.preventDefault()

        if (!election.title) {
            setTitleError(true);
            return;
        }

        // This assigns only the new fields, but otherwise keeps the existing election fields
        const newElection = {
            ...election,
            frontend_url: '', // base URL for the frontend
            owner_id: authSession.isLoggedIn() ? authSession.getIdField('sub') : tempID,
            state: 'open',
        }
        if (newElection.races.length === 1) {
            // If only one race, use main eleciton title and description
            newElection.races[0].title = newElection.title
            newElection.races[0].description = newElection.description
        }

        const newCandidates = []

        newElection.races[0].candidates.forEach(candidate => {
            if (candidate.candidate_name !== '') {
                newCandidates.push({
                    candidate_id: String(newCandidates.length),
                    candidate_name: candidate.candidate_name
                })
            }
        });
        newElection.races[0].candidates = newCandidates
        try {
            onSubmitElection(newElection)
        } catch (error) {
            console.log(error)
        }
    }

    const onUpdateCandidate = (index: number, name: string) => {
        const updatedElection = structuredClone(election)
        const candidates = updatedElection.races[0].candidates
        candidates[index].candidate_name = name
        if (index === candidates.length - 1) {
            // If last form entry is updated, add another entry to form
            candidates.push({
                candidate_id: String(updatedElection.races[0].candidates.length),
                candidate_name: '',
            })
        }
        else if (candidates.length > 3 && index === candidates.length - 2 && name === '' && candidates[candidates.length - 1].candidate_name === '') {
            // If last two entries are empty, remove last entry
            // Keep at least 3
            candidates.splice(candidates.length - 1, 1)
        }
        setElectionData(updatedElection)
    }
    const handleEnter = (event) => {
        // Go to next entry instead of submitting form
        const form = event.target.form;
        const index = Array.prototype.indexOf.call(form, event.target);
        form.elements[index + 2].focus();
        event.preventDefault();
    }

    return (
        <form onSubmit={onSubmit} >
            <Grid container >
                <Grid item xs={12} sx={{ p: 1 }}>
                    <StyledTextField
                        autoFocus
                        error={titleError}
                        helperText={titleError ? "Election name is required" : ""}
                        id="election-name"
                        name="name"
                        type="text"
                        value={election.title}
                        label="What is your poll question?"
                        sx={{
                            label: {fontWeight: 600,}
                        }}
                        required
                        onChange={(e) => {
                            setTitleError(false)
                            applyElectionUpdate(election => { election.title = e.target.value })
                        }}
                        onKeyPress={(ev) => {
                            if (ev.key === 'Enter') {
                                handleEnter(ev)
                            }
                        }}
                    />
                </Grid>

                {election.races[0].candidates?.map((candidate, index) => (
                    <Grid item xs={12} sx={{ p: 1 }}>
                        <StyledTextField
                            id={`candidate-name-${String(index)}`}
                            name="candidate-name"
                            type="text"
                            value={candidate.candidate_name}
                            label={`Option ${index + 1}`}
                            sx={{
                                label: {fontWeight: 600,}
                            }}
                            onChange={(e) => {
                                onUpdateCandidate(index, e.target.value)
                            }}
                            onKeyPress={(ev) => {
                                if (ev.key === 'Enter') {
                                    handleEnter(ev)
                                }
                            }}
                        />
                    </Grid>
                ))}
                <Grid item xs={12} sx={{ p: 1 }}>
                    <StyledButton
                        type='submit'
                        variant="contained"
                        disabled={isPending} >

                        <Typography sx={{ fontWeight: 'bold' }} >
                            Create Quick Poll
                        </Typography>

                    </StyledButton>
                </Grid>
                <Grid item xs={12} sx={{ p: 1 }}>
                    {!authSession.isLoggedIn() ?
                        <StyledButton
                            variant="contained"
                            disabled={isPending}
                            onClick={() => authSession.openLogin()}>
                            <Typography sx={{ fontWeight: 'bold' }} >
                                Log in for more settings
                            </Typography>
                        </StyledButton>
                        :
                        <StyledButton
                            variant="contained"
                            disabled={isPending}
                            href='/CreateElection'>
                            <Typography sx={{ fontWeight: 'bold' }} >
                                Explore more settings
                            </Typography>
                        </StyledButton>
                    }
                </Grid>
                <Grid item xs={11}>
                </Grid>
                <Grid item xs={1} sx={{ p: 1 }}>
                    <IconButton
                        type="button"
                        onClick={() => setElectionData(QuickPollTemplate)} >
                        <DeleteIcon />
                    </IconButton>
                </Grid>
            </Grid>
        </form >
    )
}

export default QuickPoll
