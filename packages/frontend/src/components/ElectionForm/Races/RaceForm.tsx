import React, { useCallback, useEffect, useMemo, useRef } from 'react'
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
import { scrollToElement } from '../../util';
import useElection from '../../ElectionContextProvider';
import { v4 as uuidv4 } from 'uuid';
import useConfirm from '../../ConfirmationDialogProvider';
import useFeatureFlags from '../../FeatureFlagContextProvider';
import { use } from 'i18next';

export default function RaceForm({ race_index, editedRace, errors, setErrors, applyRaceUpdate }) {
    const flags = useFeatureFlags();
    const [showsAllMethods, setShowsAllMethods] = useState(false)
    const { election } = useElection()
    const confirm = useConfirm();
    const ephemeralCandidates = useMemo(() => 
        [...editedRace.candidates, { candidate_id: uuidv4(), candidate_name: '' }], 
        [editedRace.candidates]
    );    // BottomRef creates a reference to the bottom of the window to scroll to when a new candidate is added
    const bottomRef = useRef(null);
    useEffect(() => {
        // Scroll to the bottom of the page when a new candidate is added, but not when the page is first loaded
            bottomRef.current.scrollIntoView(false)
    }, [ephemeralCandidates])

    const onEditCandidate = useCallback((candidate, index) => {
        applyRaceUpdate(race => {
            if (candidate.candidate_name === '' && index === race.candidates.length - 1 && race.candidates.length > 1) {
                race.candidates.splice(index, 1);
            } else if (race.candidates[index]) {
                race.candidates[index] = candidate;
            } else {
                race.candidates.push(candidate);
            }
        });

        setErrors(prev => ({ ...prev, candidates: '', raceNumWinners: '' }));
    }, [applyRaceUpdate, setErrors]);

    const moveCandidate = useCallback((fromIndex, toIndex) => {
        applyRaceUpdate(race => {
            const [movedCandidate] = race.candidates.splice(fromIndex, 1);
            race.candidates.splice(toIndex, 0, movedCandidate);
        });
    }, [applyRaceUpdate]);

    const moveCandidateUp = useCallback((index) => {
        if (index > 0) moveCandidate(index, index - 1);
    }, [moveCandidate]);

    const moveCandidateDown = useCallback((index) => {
        if (index < editedRace.candidates.length - 1) moveCandidate(index, index + 1);
    }, [moveCandidate, editedRace.candidates.length]);

    const onDeleteCandidate = useCallback(async (index) => {
        if (editedRace.candidates.length < 3) {
            setErrors(prev => ({ ...prev, candidates: 'At least 2 candidates are required' }));
            return;
        }

        const confirmed = await confirm({ title: 'Confirm Delete Candidate', message: 'Are you sure?' });
        if (confirmed) {
            applyRaceUpdate(race => {
                race.candidates.splice(index, 1);
            });
        }
    }, [confirm, editedRace.candidates.length, applyRaceUpdate, setErrors]);

    return (
        <>
            <Grid container sx={{ m: 0, p: 1 }} >

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
                        }
                        
                    }
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
                    ephemeralCandidates.map((candidate, index) => (
                        <CandidateForm
                            key={candidate.candidate_id}
                            onEditCandidate={(newCandidate) => onEditCandidate(newCandidate, index)}
                            candidate={candidate}
                            index={index}
                            onDeleteCandidate={() => onDeleteCandidate(index)}
                            moveCandidateUp={() => moveCandidateUp(index)}
                            moveCandidateDown={() => moveCandidateDown(index)} />
                        
                    ))
                }
            </Stack>
            {/* Scroll anchor for when a new candidate is added */}
            <div style={{height: '5px'}} ref={bottomRef}/>
        </>
    )
}
