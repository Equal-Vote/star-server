import React, { useContext, useState } from 'react'
import Container from '@mui/material/Container';
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router"
import structuredClone from '@ungap/structured-clone';
import { StyledButton, StyledTextField } from '../styles.js'
import { Box, Button, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePostElection } from '../../hooks/useAPI';
import { useCookie } from '../../hooks/useCookie';
import { Election, NewElection } from '@equal-vote/star-vote-shared/domain_model/Election';
import { CreateElectionContext } from './CreateElectionDialog.js';
import { useTranslation } from 'react-i18next';

const QuickPoll = ({ authSession, methodName, grow }) => {
    const [tempID, setTempID] = useCookie('temp_id', '0')
    const navigate = useNavigate()
    const { error, isPending, makeRequest: postElection } = usePostElection()

    const {t} = useTranslation();

    const QuickPollTemplate: NewElection = {
        title: '',
        state: 'open',
        frontend_url: '',
        owner_id: '0',
        is_public: true,
        races: [
            {   
                title: '',
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
            random_candidate_order: true,
            require_instruction_confirmation: true,
        }
    }


    const [election, setElectionData] = useState<NewElection>(QuickPollTemplate)
    const [titleError, setTitleError] = useState(false)
    const onSubmitElection = async (election) => {
        // calls post election api, throws error if response not ok
        const newElection = await postElection(
            {
                Election: election,
            })
        if ((!newElection)) {
            throw Error("Error submitting election");
        }
        setElectionData(QuickPollTemplate)
        navigate(`/${newElection.election.election_id}`)
    }
    const applyElectionUpdate = (updateFunc) => {
        const electionCopy = structuredClone(election)
        updateFunc(electionCopy)
        setElectionData(electionCopy)
    };

    const createElectionContext = useContext(CreateElectionContext);

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
            <Box 
            sx={{
                display: 'flex',
                gap: 2,
                flexDirection: 'column',
                textAlign: 'center',
                backgroundColor: "#EEEEEE",
                padding: 3,
                borderRadius: '20px',
                minWidth: {xs: '0px', md: '400px'}
            }}>
                <Typography component="h2"
                    className={grow? 'heroGrow' : 'heroShrink'}
                >{t('quick_poll.title').replace('__METHOD_NAME__', methodName)}</Typography>
                <StyledTextField
                    autoFocus
                    error={titleError}
                    id="election-name"
                    name="name"
                    type="text"
                    value={election.title}
                    label={t('quick_poll.question_prompt')}
                    inputProps={{
                        minLength: 3
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
                {election.races[0].candidates?.map((candidate, index) => (
                    <StyledTextField
                        id={`candidate-name-${String(index)}`}
                        name="candidate-name"
                        type="text"
                        value={candidate.candidate_name}
                        label={t('quick_poll.option_prompt').replace('__NUMBER__', `${index+1}`)}
                        onChange={(e) => {
                            onUpdateCandidate(index, e.target.value)
                        }}
                        onKeyPress={(ev) => {
                            if (ev.key === 'Enter') {
                                handleEnter(ev)
                            }
                        }}
                    />
                ))}
                <Box sx={{
                    marginLeft: 'auto'
                }}>
                    <IconButton
                        type="button"
                        onClick={() => setElectionData(QuickPollTemplate)}
                        >
                            <Typography component="p">{t('quick_poll.clear_all')}</Typography>
                        <DeleteIcon />
                    </IconButton>
                </Box>
                <StyledButton
                    type='submit'
                    variant="contained"
                    disabled={isPending} >
                    {t('quick_poll.create')}
                </StyledButton>
                {!authSession.isLoggedIn() ?
                    <Button
                        variant="outlined"
                        onClick={() => authSession.openLogin()}
                        sx={{
                            width: '90%',
                            p: 1,
                            m: 'auto',
                            boxShadow: 2,
                            fontWeight: 'bold',
                            fontSize: 16,
                        }}
                        disabled={isPending}
                    >
                        {t('quick_poll.sign_in')}
                    </Button>
                    :
                    <Button
                        variant="outlined"
                        onClick={() => createElectionContext.openDialog(election)}
                        sx={{
                            width: '90%',
                            p: 1,
                            m: 'auto',
                            boxShadow: 2,
                            fontWeight: 'bold',
                            fontSize: 16,
                        }}
                        disabled={isPending}
                    >
                        {t('quick_poll.continue_with_editor')}
                    </Button>
                }
                
            </Box>
        </form >
    )
}

export default QuickPoll
