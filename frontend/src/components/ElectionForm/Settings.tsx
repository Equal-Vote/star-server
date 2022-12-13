import React from 'react'
import { useState } from "react"
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
// https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
// https://web.dev/structured-clone/
import structuredClone from '@ungap/structured-clone';
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from '@mui/material/Typography';
import { Box, Checkbox, InputLabel } from "@mui/material"
import IconButton from '@mui/material/IconButton'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { Input } from '@mui/material';
import { Election } from '../../../../domain_model/Election';

type SettingsProps = {
    election: Election,
    applyElectionUpdate: Function,
    getStyle: any
}

export default function Settings({ election, applyElectionUpdate, getStyle }: SettingsProps) {
    const [expandedSettings, setExpandedSettings] = useState(false)

    const dateAsInputString = (date) => {
        if (date == null) return ''
        if (isNaN(date.valueOf())) return ''
        // Remove time zone offset before switching to ISO
        var s = (new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString());
        s = s.replace(':00.000Z', '')
        return s
    }

    const updateVoterAccess = (voter_access) => {
        applyElectionUpdate(election => {
            election.settings.voter_access = voter_access
            if (voter_access === 'open') {
                election.settings.voter_authentication.voter_id = false
                election.settings.invitations = undefined
            }})
    }


    return (
        <>
            <Grid item xs={11}>
                <Typography gutterBottom variant="h6" component="h6">Election Settings</Typography>
            </Grid>
            {!expandedSettings &&
                <Grid item xs={1}>
                    <IconButton aria-label="Home" onClick={() => { setExpandedSettings(true) }}>
                        <ExpandMore />
                    </IconButton>
                </Grid>}
            {expandedSettings &&
                <Grid item xs={1}>
                    <IconButton aria-label="Home" onClick={() => { setExpandedSettings(false) }}>
                        <ExpandLess />
                    </IconButton>
                </Grid>}

            {expandedSettings &&
                <>
                    <Grid item xs={12} >
                        <TextField
                            id="election-description"
                            name="description"
                            label="Description"
                            multiline
                            fullWidth
                            type="text"
                            value={election.description}
                            sx={{
                                mx: { xs: 0, },
                                my: { xs: 1 },
                                boxShadow: 2,
                            }}
                            onChange={(e) => applyElectionUpdate(election => { election.description = e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                Start Date
                            </InputLabel>
                        </FormControl>
                        <Input
                            type='datetime-local'
                            value={dateAsInputString(election.start_time)}
                            onChange={(e) => applyElectionUpdate(election => election.start_time = new Date(e.target.value))}
                            sx={{
                                mx: { xs: 0, },
                                my: { xs: 1 },
                                py: 1,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                Stop Date
                            </InputLabel>
                        </FormControl>
                        <Input
                            type='datetime-local'
                            value={dateAsInputString(election.end_time)}
                            onChange={(e) => applyElectionUpdate(election => { election.end_time = new Date(e.target.value) })}
                            sx={{
                                mx: { xs: 0, },
                                my: { xs: 1 },
                                py: 1,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={{
                            mx: { xs: 0, },
                            my: { xs: 1 },
                            boxShadow: 2,
                        }}>
                            <InputLabel htmlFor="uncontrolled-native">
                                Voter Access
                            </InputLabel>
                            <Select
                                name="Voter Access"
                                label="Voter Access"
                                value={election.settings.voter_access}
                                onChange={(e) => updateVoterAccess(e.target.value)}
                                >
                                <MenuItem key="open" value="open">
                                    Open
                                </MenuItem>
                                <MenuItem key="closed" value="closed">
                                    Closed
                                </MenuItem>
                                <MenuItem key="registration" value="registration">
                                    Registration
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <FormControlLabel 
                            disabled = {election.settings.voter_access!=='closed'}
                            control={
                            <Checkbox
                                id="voter-id"
                                name="Voter ID"
                                checked={election.settings.invitation !== undefined}
                                onChange={(e) => applyElectionUpdate(election => { election.settings.invitation = e.target.value ? 'email' : undefined })}
                            />}
                            label="Voter ID"
                        />
                    </Grid>
                    

                    <Grid item xs={12}>
                        <FormControlLabel 
                            disabled = {election.settings.voter_access==='open'}
                            control={
                            <Checkbox
                                id="voter-id"
                                name="Voter ID"
                                checked={election.settings.voter_authentication.voter_id}
                                onChange={(e) => applyElectionUpdate(election => { election.settings.voter_authentication.voter_id = e.target.value })}
                            />}
                            label="Voter ID"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel control={
                            <Checkbox
                                id="email"
                                name="Email"
                                checked={election.settings.voter_authentication.email}
                                onChange={(e) => applyElectionUpdate(election => { election.settings.two_factor_auth = e.target.value })}
                            />}
                            label="Email"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel disabled control={
                            <Checkbox
                                id="ballot-updates"
                                name="Ballot Updates"
                                checked={election.settings.ballot_updates}
                                onChange={(e) => applyElectionUpdate(election => { election.settings.ballot_updates = e.target.value })}
                            />}
                            label="Ballot Updates"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel disabled control={
                            <Checkbox
                                id="public-results"
                                name="Public Results"
                                checked={election.settings.public_results}
                                onChange={(e) => applyElectionUpdate(election => { election.settings.public_results = e.target.value })}
                            />}
                            label="Public Results"
                        />
                    </Grid>
                </>
            }
        </>
    )
}
