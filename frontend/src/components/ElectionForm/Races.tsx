import React from 'react'
import { useState } from "react"
import { Candidate } from "../../../../domain_model/Candidate"
import AddCandidate from "./AddCandidate"
// import Button from "./Button"
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
// https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
// https://web.dev/structured-clone/
import structuredClone from '@ungap/structured-clone';
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import { Box, Checkbox, InputLabel } from "@mui/material"
import IconButton from '@mui/material/IconButton'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { StyledButton } from '../styles';

export default function Races({ election, applyElectionUpdate, getStyle }) {
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

    const onAddRace = () => {
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
    }

    const onEditCandidate = (race_index, candidate: Candidate, index) => {
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
                            {election.races.length > 1 &&
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
                                            value={election.races[race_index].title}
                                            sx={{
                                                m: 0,
                                                boxShadow: 2,
                                            }}
                                            fullWidth
                                            onChange={(e) => applyElectionUpdate(election => { election.races[race_index].title = e.target.value })}
                                        />
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
                                            value={election.races[race_index].description}
                                            sx={{
                                                m: 0,
                                                boxShadow: 2,
                                            }}
                                            onChange={(e) => applyElectionUpdate(election => { election.races[race_index].description = e.target.value })}
                                        />
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
                                    inputProps={getStyle('races', 0, 'num_winners')}
                                    type="number"
                                    fullWidth
                                    value={election.races[race_index].num_winners}
                                    sx={{
                                        p: 0,
                                        boxShadow: 2,
                                    }}
                                    onChange={(e) => applyElectionUpdate(election => { election.races[race_index].num_winners = e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                                <Box sx={{ minWidth: 120 }}>
                                    <FormControl fullWidth sx={{
                                        m: 0,
                                        boxShadow: 2,
                                    }}>
                                        <InputLabel >
                                            Voting Method
                                        </InputLabel>
                                        <Select
                                            name="Voting Method"
                                            label="Voting Method"
                                            value={election.races[race_index].voting_method}
                                            onChange={(e) => applyElectionUpdate(election => { election.races[race_index].voting_method = e.target.value })}
                                        >
                                            <MenuItem key="STAR" value="STAR">
                                                STAR
                                            </MenuItem>
                                            <MenuItem key="STAR-PR" value="STAR-PR">
                                                STAR-PR
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                                <Typography gutterBottom variant="h6" component="h6">
                                    Candidates
                                </Typography>
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
                            onClick={() => { setOpenRace(openRace - 1) }}>
                            Previous
                        </StyledButton>
                    </Grid>
                    <Grid xs={6}></Grid>
                    <Grid item xs={3} sx={{ m: 0, p: 1 }}>
                        <StyledButton
                            type='button'
                            variant="contained"
                            disabled={openRace >= election.races.length - 1}
                            onClick={() => { setOpenRace(openRace + 1) }}>
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
        </>
    )
}
