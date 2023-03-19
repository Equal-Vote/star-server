import React from 'react'
import { useState } from "react"
import { Candidate } from "../../../../domain_model/Candidate"
import AddCandidate from "./AddCandidate"
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from '@mui/material/Typography';
import { Box, Checkbox, FormGroup, FormHelperText, FormLabel, InputLabel, Radio, RadioGroup, Tooltip } from "@mui/material"
import { StyledButton } from '../styles';

export default function Races({ election, applyElectionUpdate, getStyle, setPageNumber, submitText, onSubmit }) {
    const [openRace, setOpenRace] = useState(0)
    const [newCandidateName, setNewCandidateName] = useState('')
    const onAddCandidate = (race_index) => {
        applyElectionUpdate(election => {
            election.races[race_index].candidates?.push(
                {
                    candidate_id: String(election.races[race_index].candidates.length),
                    candidate_name: newCandidateName, // short mnemonic for the candidate
                    full_name: '',
                }
            )
        })
        setNewCandidateName('')
    }

    const [multipleRaces, setMultipleRaces] = useState(election.races.length > 1)
    const [errors, setErrors] = useState({
        raceTitle: '',
        raceDescription: '',
        raceNumWinners: '',
        candidates: ''
    })
    const validatePage = () => {
        let isValid = 1
        let newErrors: any = {}
        let race = election.races[openRace]
        if (election.races.length > 1 || multipleRaces) {
            if (!race.title) {
                newErrors.raceTitle = 'Race title required';
                isValid = 0;
            }
            else if (race.title.length < 3 || race.title.length > 256) {
                newErrors.raceTitle = 'Race title must be between 3 and 256 characters';
                isValid = 0;
            }
            if (race.description && race.description.length > 1000) {
                newErrors.raceDescription = 'Race title must be less than 1000 characters';
                isValid = 0;
            }
        }
        if (race.num_winners < 1) {
            newErrors.raceNumWinners = 'Must have at least one winner';
            isValid = 0;
        }
        const numCandidates = race.candidates.filter(candidate => candidate.candidate_name !== '').length
        if (race.num_winners > numCandidates) {
            newErrors.raceNumWinners = 'Cannot have more winners than candidates';
            isValid = 0;
        }
        if (numCandidates < 2) {
            newErrors.candidates = 'Must have at least 2 candidates';
            isValid = 0;
        }
        const uniqueCandidates = new Set(race.candidates.filter(candidate => candidate.candidate_name !== '').map(candidate => candidate.candidate_name))
        if (numCandidates !== uniqueCandidates.size) {
            newErrors.candidates = 'Candidates must have unique names';
            isValid = 0;
        }
        setErrors(errors => ({ ...errors, ...newErrors }))

        return isValid
    }
    console.log(errors)
    const onAddRace = () => {
        if (election.races.length === 1 && !multipleRaces) {
            // If there is only one race currently and this is the first time being run, set title required error because that field hasn't been shown yet.
            setMultipleRaces(true)
            setErrors(errors => ({ ...errors, raceTitle: 'Race title required' }))
            validatePage()
            return
        }
        if (validatePage()) {
            const currentCount = election.races.length
            applyElectionUpdate(election => {
                election.races.push(
                    {
                        race_id: String(election.races.length),
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
                        ] as Candidate[],
                        precincts: undefined,
                    }
                )
            })
            setOpenRace(currentCount)
        }

    }

    const onEditCandidate = (race_index, candidate: Candidate, index) => {
        setErrors({ ...errors, candidates: '', raceNumWinners: '' })
        applyElectionUpdate(election => {
            election.races[race_index].candidates[index] = candidate
            const candidates = election.races[openRace].candidates
            if (index === candidates.length - 1) {
                // If last form entry is updated, add another entry to form
                candidates.push({
                    candidate_id: String(election.races[openRace].candidates.length),
                    candidate_name: '',
                })
            }
        })
    }

    return (
        <>
            <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                <Typography gutterBottom variant="h4" component="h4">Race Settings</Typography>
            </Grid>
            {election.races?.map((race, race_index) => (
                <>
                    {openRace === race_index &&
                        <>
                            {multipleRaces &&
                                <>
                                    <Grid item xs={11} sx={{ m: 0, p: 1 }}>
                                        <Typography gutterBottom variant="h6" component="h6">{`Race ${race_index + 1}`}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                                        <TextField
                                            id={`race-title-${String(race_index)}`}
                                            name="title"
                                            label="Title"
                                            inputProps={getStyle('description')}
                                            type="text"
                                            error={errors.raceTitle !== ''}
                                            // helperText={errors.raceTitle}
                                            value={election.races[race_index].title}
                                            sx={{
                                                m: 0,
                                                boxShadow: 2,
                                            }}
                                            fullWidth
                                            onChange={(e) => {
                                                setErrors({ ...errors, raceTitle: '' })
                                                applyElectionUpdate(election => { election.races[race_index].title = e.target.value })
                                            }}
                                        />
                                        <FormHelperText error sx={{ pl: 1, pt: 0 }}>
                                            {errors.raceTitle}
                                        </FormHelperText>
                                    </Grid>

                                    <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                                        <TextField
                                            id={`race-description-${String(race_index)}`}
                                            name="description"
                                            label="Description"
                                            inputProps={getStyle('description')}
                                            multiline
                                            fullWidth
                                            type="text"
                                            error={errors.raceDescription !== ''}
                                            // helperText={errors.raceDescription}
                                            value={election.races[race_index].description}
                                            sx={{
                                                m: 0,
                                                boxShadow: 2,
                                            }}
                                            onChange={(e) => {
                                                setErrors({ ...errors, raceDescription: '' })
                                                applyElectionUpdate(election => { election.races[race_index].description = e.target.value })
                                            }}
                                        />
                                        <FormHelperText error sx={{ pl: 1, pt: 0 }}>
                                            {errors.raceDescription}
                                        </FormHelperText>
                                    </Grid>

                                    {/* {election.settings.voter_access !== 'open' &&
                                        <Grid item xs={12}>
                                            <TextField
                                                id={`race-precincts-${String(race_index)}`}
                                                name="precincts"
                                                label="Precincts"
                                                inputProps={getStyle('description')}
                                                fullWidth
                                                multiline
                                                type="text"
                                                value={race.precincts ? election.races[race_index].precincts.join('\n') : ''}
                                                sx={{
                                                    m: 1,
                                                    boxShadow: 2,
                                                }}
                                                onChange={(e) => applyElectionUpdate(election => {
                                                    if (e.target.value === '') {
                                                        election.races[race_index].precincts = undefined
                                                    }
                                                    else {
                                                        election.races[race_index].precincts = e.target.value.split('\n')
                                                    }
                                                })}
                                            />
                                        </Grid>} */}
                                </>}
                            <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                                <TextField
                                    id={`num-winners-${String(race_index)}`}
                                    name="Number Of Winners"
                                    label="Number of Winners"
                                    inputProps={{ ...getStyle('races', 0, 'num_winners'), min: 1 }}
                                    type="number"
                                    error={errors.raceNumWinners !== ''}
                                    // helperText={errors.raceNumWinners}
                                    fullWidth
                                    value={election.races[race_index].num_winners}
                                    sx={{
                                        p: 0,
                                        boxShadow: 2,
                                    }}
                                    onChange={(e) => {
                                        setErrors({ ...errors, raceNumWinners: '' })
                                        applyElectionUpdate(election => { election.races[race_index].num_winners = e.target.value })
                                    }}
                                />
                                <FormHelperText error sx={{ pl: 1, pt: 0 }}>
                                    {errors.raceNumWinners}
                                </FormHelperText>
                            </Grid>

                            <Grid item xs={12} sx={{ m: 0, my: 1, p: 1 }}>
                                <FormControl component="fieldset" variant="standard">
                                    <FormLabel id="voter-access">
                                        Voting Method
                                    </FormLabel>
                                    <RadioGroup
                                        aria-labelledby="voting-method-radio-group"
                                        name="voter-access-radio-buttons-group"
                                        value={election.races[race_index].voting_method}
                                        onChange={(e) => applyElectionUpdate(election => { election.races[race_index].voting_method = e.target.value })}
                                    >
                                        <FormControlLabel value="STAR" control={<Radio />} label="STAR" sx={{ mb: 0, pb: 0 }} />
                                        <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                            Score candidates 0-5, single winner or multi-winner
                                        </FormHelperText>

                                        <FormControlLabel value="STAR_PR" control={<Radio />} label="Proportional STAR" />
                                        <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                            Score candidates 0-5, proportional multi-winner
                                        </FormHelperText>

                                        <FormControlLabel value="RankedRobin" control={<Radio />} label="Ranked Robin" />
                                        <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                            Rank candidates in order of preference, single winner or multi-winner
                                        </FormHelperText>

                                        <FormControlLabel value="Approval" control={<Radio />} label="Approval" />
                                        <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                            Mark all candidates you approve of, single winner or multi-winner
                                        </FormHelperText>
                                        
                                        <FormControlLabel value="Plurality" control={<Radio />} label="Plurality" />
                                        <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                            Mark one candidate only. Not recommended with more than 2 candidates.
                                        </FormHelperText>
                                        
                                        <FormControlLabel value="IRV" control={<Radio />} label="Ranked Choice" />
                                        <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                            Rank candidates in order of preference, single winner, only recommended for educational purposes
                                        </FormHelperText>
                                    </RadioGroup>
                                </FormControl>


                            </Grid>
                            <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                                <Typography gutterBottom variant="h6" component="h6">
                                    Candidates
                                </Typography>
                                <FormHelperText error sx={{ pl: 1, mt: -1 }}>
                                    {errors.candidates}
                                </FormHelperText>
                            </Grid>
                            {election.races[race_index].candidates?.map((candidate, index) => (
                                <>
                                    <AddCandidate
                                        onEditCandidate={(newCandidate) => onEditCandidate(race_index, newCandidate, index)}
                                        candidate={candidate}
                                        index={index} />
                                </>
                            ))}
                        </>}
                </>
            ))}

            {election.races.length > 1 &&
                <>
                    <Grid item xs={3} sx={{ m: 0, p: 1 }}>
                        <StyledButton
                            type='button'
                            variant="contained"
                            disabled={openRace < 1}
                            onClick={() => {
                                if (validatePage()) {
                                    setOpenRace(openRace => openRace - 1)
                                }
                            }}>
                            Previous
                        </StyledButton>
                    </Grid>
                    <Grid xs={6}></Grid>
                    <Grid item xs={3} sx={{ m: 0, p: 1 }}>
                        <StyledButton
                            type='button'
                            variant="contained"
                            disabled={openRace >= election.races.length - 1}
                            onClick={() => {
                                if (validatePage()) {
                                    setOpenRace(openRace => openRace + 1)
                                }
                            }}>
                            Next Race
                        </StyledButton>
                    </Grid>
                    <Grid xs={6}></Grid>
                </>
            }
            <Grid xs={9}></Grid>
            <Grid item xs={3} sx={{ m: 0, p: 1 }}>
                <StyledButton
                    type='button'
                    variant="contained"
                    onClick={() => onAddRace()} >
                    Add Race
                </StyledButton>
            </Grid>
            <Grid item xs={3} sx={{ m: 0, p: 1, pt: 2 }}>
                <StyledButton
                    type='button'
                    variant="contained"
                    width="100%"
                    onClick={() => {
                        if (validatePage()) {
                            setPageNumber(pageNumber => pageNumber - 1)
                        }
                    }}>
                    Back
                </StyledButton>
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={3} sx={{ m: 0, p: 1, pt: 2 }}>
                <StyledButton
                    type='button'
                    variant="contained"
                    fullWidth
                    disabled>
                    Next
                </StyledButton>
            </Grid>
            <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                <StyledButton
                    type='button'
                    variant="contained"
                    onClick={() => {
                        if (validatePage()) {
                            onSubmit()
                        }
                    }
                    }>
                    {submitText}
                </StyledButton>
            </Grid>
        </>
    )
}
