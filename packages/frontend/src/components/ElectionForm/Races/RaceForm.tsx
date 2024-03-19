import React from 'react'
import { useState } from "react"
import { Candidate } from "@equal-vote/star-vote-shared/domain_model/Candidate"
import AddCandidate, { CandidateForm } from "../Candidates/AddCandidate"
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from '@mui/material/Typography';
import { Box, FormHelperText, Radio, RadioGroup, Stack } from "@mui/material"
import IconButton from '@mui/material/IconButton'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
// import { scrollToElement } from '../../util';
import useElection from '../../ElectionContextProvider';
import { v4 as uuidv4 } from 'uuid';
import useConfirm from '../../ConfirmationDialogProvider';
import useFeatureFlags from '../../FeatureFlagContextProvider';

export default function RaceForm({ race_index, editedRace, errors, setErrors, applyRaceUpdate }) {
    const flags = useFeatureFlags();
    const [showsAllMethods, setShowsAllMethods] = useState(false)
    const { election } = useElection()

    const confirm = useConfirm();

    const onEditCandidate = (candidate: Candidate, index) => {
        setErrors({ ...errors, candidates: '', raceNumWinners: '' })
        applyRaceUpdate(race => {
            race.candidates[index] = candidate
            const candidates = race.candidates
            if (index === candidates.length - 1) {
                // If last form entry is updated, add another entry to form
                candidates.push({
                    candidate_id: String(race.candidates.length),
                    candidate_name: '',
                })
            }
            while (candidates.length >= 2 && candidates[candidates.length - 1].candidate_name == '' && candidates[candidates.length - 2].candidate_name == '') {
                candidates.pop();
            }
        })
    }

    const onAddNewCandidate = (newCandidateName: string) => {
        applyRaceUpdate(race => {
            race.candidates.push({
                candidate_id: uuidv4(),
                candidate_name: newCandidateName,
            })
        })
    }

    const moveCandidate = (fromIndex: number, toIndex: number) => {
        applyRaceUpdate(race => {
            let candidate = race.candidates.splice(fromIndex, 1)[0];
            race.candidates.splice(toIndex, 0, candidate);
        })
    }

    const moveCandidateUp = (index: number) => {
        if (index > 0) {
            moveCandidate(index, index - 1)
        }
    }
    const moveCandidateDown = (index: number) => {
        if (index < editedRace.candidates.length - 1) {
            moveCandidate(index, index + 1)
        }
    }

    const onDeleteCandidate = async (index: number) => {
        const confirmed = await confirm({ title: 'Confirm Delete Candidate', message: 'Are you sure?' })
        if (!confirmed) return
        applyRaceUpdate(race => {
            race.candidates.splice(index, 1)
        })
    }

    return (
        <>
            <Grid container sx={{ m: 0, p: 1 }}>

                <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                    <TextField
                        id={`race-title-${String(race_index)}`}
                        name="title"
                        label="Title"
                        type="text"
                        error={errors.raceTitle !== ''}
                        value={editedRace.title}
                        sx={{
                            m: 0,
                            boxShadow: 2,
                        }}
                        fullWidth
                        onChange={(e) => {
                            setErrors({ ...errors, raceTitle: '' })
                            applyRaceUpdate(race => { race.title = e.target.value })
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
                        multiline
                        fullWidth
                        type="text"
                        error={errors.raceDescription !== ''}
                        value={editedRace.description}
                        sx={{
                            m: 0,
                            boxShadow: 2,
                        }}
                        onChange={(e) => {
                            setErrors({ ...errors, raceDescription: '' })
                            applyRaceUpdate(race => { race.description = e.target.value })
                        }}
                    />
                    <FormHelperText error sx={{ pl: 1, pt: 0 }}>
                        {errors.raceDescription}
                    </FormHelperText>
                </Grid>

                {
                    flags.isSet('PRECINCTS') && election.settings.voter_access !== 'open' &&
                    <Grid item xs={12}>
                        <TextField
                            id={`race-precincts-${String(race_index)}`}
                            name="precincts"
                            label="Precincts"
                            fullWidth
                            multiline
                            type="text"
                            value={editedRace.precincts ? editedRace.precincts.join('\n') : ''}
                            sx={{
                                m: 1,
                                boxShadow: 2,
                            }}
                            onChange={(e) => applyRaceUpdate(race => {
                                if (e.target.value === '') {
                                    race.precincts = undefined
                                }
                                else {
                                    race.precincts = e.target.value.split('\n')
                                }
                            })}
                        />
                    </Grid>
                }
                {
                    flags.isSet('MULTI_WINNER') &&
                    <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                        <Typography gutterBottom variant="h6" component="h6">
                            Number of Winners
                        </Typography>
                        <TextField
                            id={`num-winners-${String(race_index)}`}
                            name="Number Of Winners"
                            type="number"
                            error={errors.raceNumWinners !== ''}
                            fullWidth
                            value={editedRace.num_winners}
                            sx={{
                                p: 0,
                                boxShadow: 2,
                            }}
                            onChange={(e) => {
                                setErrors({ ...errors, raceNumWinners: '' })
                                applyRaceUpdate(race => { race.num_winners = parseInt(e.target.value) })
                            }}
                        />
                        <FormHelperText error sx={{ pl: 1, pt: 0 }}>
                            {errors.raceNumWinners}
                        </FormHelperText>
                    </Grid>
                }

                <Grid item xs={12} sx={{ m: 0, my: 1, p: 1 }}>
                    <FormControl component="fieldset" variant="standard">
                        <Typography gutterBottom variant="h6" component="h6">
                            Voting Method
                        </Typography>
                        <RadioGroup
                            aria-labelledby="voting-method-radio-group"
                            name="voter-method-radio-buttons-group"
                            value={editedRace.voting_method}
                            onChange={(e) => applyRaceUpdate(race => { race.voting_method = e.target.value })}
                        >
                            <FormControlLabel value="STAR" control={<Radio />} label="STAR" sx={{ mb: 0, pb: 0 }} />
                            <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                Score candidates 0-5, single winner or multi-winner
                            </FormHelperText>

                            {flags.isSet('METHOD_STAR_PR') && <>
                                <FormControlLabel value="STAR_PR" control={<Radio />} label="Proportional STAR" />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Score candidates 0-5, proportional multi-winner
                                </FormHelperText>
                            </>}

                            {flags.isSet('METHOD_RANKED_ROBIN') && <>
                                <FormControlLabel value="RankedRobin" control={<Radio />} label="Ranked Robin" />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Rank candidates in order of preference, single winner or multi-winner
                                </FormHelperText>
                            </>}

                            {flags.isSet('METHOD_APPROVAL') && <>
                                <FormControlLabel value="Approval" control={<Radio />} label="Approval" />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Mark all candidates you approve of, single winner or multi-winner
                                </FormHelperText>
                            </>}

                            <Box
                                display='flex'
                                justifyContent="left"
                                alignItems="center"
                                sx={{ width: '100%', ml: -1 }}>

                                {!showsAllMethods &&
                                    <IconButton aria-label="Home" onClick={() => { setShowsAllMethods(true) }}>
                                        <ExpandMore />
                                    </IconButton>}
                                {showsAllMethods &&
                                    <IconButton aria-label="Home" onClick={() => { setShowsAllMethods(false) }}>
                                        <ExpandLess />
                                    </IconButton>}
                                <Typography variant="body1" >
                                    More Options
                                </Typography>
                            </Box>
                            {showsAllMethods &&
                                <Box
                                    display='flex'
                                    justifyContent="left"
                                    alignItems="center"
                                    sx={{ width: '100%', pl: 4, mt: -1 }}>

                                    <FormHelperText >
                                        These voting methods do not guarantee every voter an equally powerful vote if there are more than two candidates.
                                    </FormHelperText>
                                </Box>
                            }
                            {showsAllMethods &&
                                <>
                                    <FormControlLabel value="Plurality" control={<Radio />} label="Plurality" />
                                    <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                        Mark one candidate only. Not recommended with more than 2 candidates.
                                    </FormHelperText>

                                    {flags.isSet('METHOD_RANKED_CHOICE') && <>
                                        <FormControlLabel value="IRV" control={<Radio />} label="Ranked Choice" />
                                        <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                            Rank candidates in order of preference, single winner, only recommended for educational purposes
                                        </FormHelperText>
                                    </>}
                                </>
                            }
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
            </Grid>
            <Stack spacing={2}>
                {
                    editedRace.candidates?.map((candidate, index) => (
                        <CandidateForm
                            onEditCandidate={(newCandidate) => onEditCandidate(newCandidate, index)}
                            candidate={candidate}
                            index={index}
                            onDeleteCandidate={() => onDeleteCandidate(index)}
                            moveCandidateUp={() => moveCandidateUp(index)}
                            moveCandidateDown={() => moveCandidateDown(index)} />
                    ))
                }
                <AddCandidate
                    onAddNewCandidate={onAddNewCandidate} />
            </Stack>
        </>
    )
}
