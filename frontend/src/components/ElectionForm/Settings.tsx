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

export default function Settings({ election, applyElectionUpdate, getStyle }) {
    const [expandedSettings, setExpandedSettings] = useState(false)

    const dateAsInputString = (date) => {
        if (date == null) return ''
        if (isNaN(date.valueOf())) return ''
        // Remove time zone offset before switching to ISO
        var s = (new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString());
        s = s.replace(':00.000Z', '')
        return s
    }
    const onUpdateElectionRoll = (voterRoll: string) => {
        applyElectionUpdate(election => {
            election.settings.election_roll_type = voterRoll;
            if (voterRoll === 'None') {
                election.settings.voter_id_type = 'IP Address';
            } else if (voterRoll === 'Email') {
                election.settings.voter_id_type = 'Email';
            } else if (voterRoll === 'IDs') {
                election.settings.voter_id_type = 'IDs';
            }
        })
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
                                Election Roll
                            </InputLabel>
                            <Select
                                name="Election Roll"
                                label="Election Roll"
                                value={election.settings.election_roll_type}
                                onChange={(e) => onUpdateElectionRoll(e.target.value as string)}
                            >
                                <MenuItem key="None" value="None">
                                    None
                                </MenuItem>
                                <MenuItem key="Email" value="Email">
                                    Email
                                </MenuItem>
                                <MenuItem key="IDs" value="IDs">
                                    IDs
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    {election.settings.election_roll_type === 'None' &&
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth sx={{
                                mx: { xs: 0, },
                                my: { xs: 1 },
                                boxShadow: 2,
                            }}>
                                <InputLabel htmlFor="uncontrolled-native">
                                    Voter ID Type
                                </InputLabel>
                                <Select
                                    name="Voter ID"
                                    label="Voter ID Type"
                                    value={election.settings.voter_id_type}
                                    onChange={(e) => applyElectionUpdate(election => { election.settings.voter_id_type = e.target.value })}
                                >
                                    <MenuItem key="None" value="None">
                                        None
                                    </MenuItem>
                                    <MenuItem key="IP Address" value="IP Address">
                                        IP Address
                                    </MenuItem>
                                    <MenuItem key="Email" value="Email">
                                        Email (Requires Login)
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                    }
                    <Grid item xs={12}>
                        <FormControlLabel disabled control={
                            <Checkbox
                                id="email-verification"
                                name="Email Verification"
                                checked={election.settings.email_verification}
                                onChange={(e) => applyElectionUpdate(election => { election.settings.email_verification = e.target.value })}
                            />}
                            label="Email Verification"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel disabled control={
                            <Checkbox
                                id="two-factor-auth"
                                name="Two Factor Auth"
                                checked={election.settings.two_factor_auth}
                                onChange={(e) => applyElectionUpdate(election => { election.settings.two_factor_auth = e.target.value })}
                            />}
                            label="Two Factor Auth"
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
