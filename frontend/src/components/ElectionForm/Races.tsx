import React from 'react'
import { useState } from "react"
import { Candidate } from "../../../../domain_model/Candidate"
import AddCandidate from "./AddCandidate"
// import Button from "./Button"
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
// https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
// https://web.dev/structured-clone/
import structuredClone from '@ungap/structured-clone';
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import { Box, Checkbox, InputLabel } from "@material-ui/core"
import IconButton from '@material-ui/core/IconButton'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

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
                    candidates: [] as Candidate[],
                    precincts: undefined,
                }
            )
        })
    }

    const onSaveCandidate = (race_index, candidate: Candidate, index) => {
        applyElectionUpdate(election => {
            election.races[race_index].candidates[index] = candidate
        })
    }
    return (
        <>
            <Typography gutterBottom variant="h6" component="h6">Race Settings</Typography>
            {election.races?.map((race, race_index) => (
                <>
                    {election.races.length > 1 &&
                        <Grid container alignItems="center">
                            <Grid item sm={11}>
                                <Typography gutterBottom variant="h6" component="h6">{`Race ${race_index + 1}`}</Typography>
                            </Grid>
                            {!(openRace === race_index) &&
                                <Grid item sm={1}>
                                    <IconButton aria-label="Home" onClick={() => { setOpenRace(race_index) }}>
                                        <ExpandMore />
                                    </IconButton>
                                </Grid>}
                            {openRace === race_index &&
                                <Grid item sm={1}>
                                    <IconButton aria-label="Home" onClick={() => { setOpenRace(-1) }}>
                                        <ExpandLess />
                                    </IconButton>
                                </Grid>}
                        </Grid>
                    }

                    {openRace === race_index &&
                        <>
                            {election.races.length > 1 &&
                                <>
                                    <Grid item>
                                        <TextField
                                            id={`race-title-${String(race_index)}`}
                                            name="title"
                                            label="Title"
                                            inputProps={getStyle('description')}
                                            type="text"
                                            value={election.races[race_index].title}
                                            onChange={(e) => applyElectionUpdate(election => { election.races[race_index].title = e.target.value })}
                                        />
                                    </Grid>

                                    <Grid item>
                                        <TextField
                                            id={`race-description-${String(race_index)}`}
                                            name="description"
                                            label="Description"
                                            inputProps={getStyle('description')}
                                            multiline
                                            type="text"
                                            value={election.races[race_index].description}
                                            onChange={(e) => applyElectionUpdate(election => { election.races[race_index].description = e.target.value })}
                                        />
                                    </Grid>

                                    {election.settings.election_roll_type !== 'None' &&
                                        <Grid item>
                                            <TextField
                                                id={`race-precincts-${String(race_index)}`}
                                                name="precincts"
                                                label="Precincts"
                                                inputProps={getStyle('description')}
                                                multiline
                                                type="text"
                                                value={race.precincts ? election.races[race_index].precincts.join('\n') : ''}
                                                onChange={(e) => applyElectionUpdate(election => {
                                                    if (e.target.value === '') {
                                                        election.races[race_index].precincts = undefined
                                                    }
                                                    else {
                                                        election.races[race_index].precincts = e.target.value.split('\n')
                                                    }
                                                })}
                                            />
                                        </Grid>}
                                </>}
                            <Grid item>
                                <Box sx={{ minWidth: 120 }}>
                                    <FormControl fullWidth>
                                        <InputLabel variant="standard" htmlFor="uncontrolled-native">
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
                            <Grid item>
                                <TextField
                                    id={`num-winners-${String(race_index)}`}
                                    name="Number Of Winners"
                                    label="Number of Winners"
                                    inputProps={getStyle('races', 0, 'num_winners')}
                                    type="number"
                                    value={election.races[race_index].num_winners}
                                    onChange={(e) => applyElectionUpdate(election => { election.races[race_index].num_winners = e.target.value })}
                                />
                            </Grid>
                            <Divider light />
                            <Typography gutterBottom variant="h6" component="h6">
                                Candidates
                            </Typography>
                            {election.races[race_index].candidates?.map((candidate, index) => (
                                <Grid item sm={12}>
                                    <AddCandidate onSaveCandidate={(newCandidate) => onSaveCandidate(race_index, newCandidate, index)} candidate={candidate} index={index} />
                                    <Divider light />
                                </Grid>
                            ))}
                            <Grid container>
                                <Grid item sm={8}>
                                    <TextField
                                        id={`new-candidate-name-${String(race_index)}`}
                                        name="new-candidate-name"
                                        label="New Candidate Name"
                                        type="text"
                                        value={newCandidateName}
                                        fullWidth
                                        onChange={(e) => {
                                            setNewCandidateName(e.target.value)
                                        }}
                                        onKeyPress={(ev) => {
                                            if (ev.key === 'Enter') {
                                                onAddCandidate(race_index)
                                                ev.preventDefault();
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item sm={4}>
                                    <Button variant='outlined' onClick={() => onAddCandidate(race_index)} >Add</Button>
                                </Grid>
                            </Grid>
                        </>}
                    <Divider light />
                </>
            ))}

            <Button variant='outlined' onClick={() => onAddRace()} >Add Race</Button>
        </>
    )
}
