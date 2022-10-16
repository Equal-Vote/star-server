import React from 'react'
import { useState } from "react"
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
// https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
// https://web.dev/structured-clone/
import structuredClone from '@ungap/structured-clone';
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from '@material-ui/core/Typography';
import { Box, Checkbox, InputLabel } from "@material-ui/core"
import IconButton from '@material-ui/core/IconButton'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

export default function Settings({ election, applyElectionUpdate, getStyle }) {
    const [expandedSettings, setExpandedSettings] = useState(false)
    
    const dateAsInputString = (date) => {
        // TODO: Using ISO create a bug with timezones
        //       ex. If I select April 20th late in the PDT timezone, that's April 21th in UTC/ISO, so it sets April 21
        if (date == null) return ''
        if (isNaN(date.valueOf())) return ''
        var s = date.toISOString()
        // the timezone offset throws off the input component
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
            <Grid container alignItems="center">
                <Grid item sm={11}>
                    <Typography gutterBottom variant="h6" component="h6">Election Settings</Typography>
                </Grid>
                {!expandedSettings &&
                    <Grid item sm={1}>
                        <IconButton aria-label="Home" onClick={() => { setExpandedSettings(true) }}>
                            <ExpandMore />
                        </IconButton>
                    </Grid>}
                {expandedSettings &&
                    <Grid item sm={1}>
                        <IconButton aria-label="Home" onClick={() => { setExpandedSettings(false) }}>
                            <ExpandLess />
                        </IconButton>
                    </Grid>}
            </Grid>

            {expandedSettings &&
                <div>
                    <Grid item>
                        <TextField
                            id="election-description"
                            name="description"
                            label="Description"
                            inputProps={getStyle('description')}
                            multiline
                            type="text"
                            value={election.description}
                            onChange={(e) => applyElectionUpdate(election => { election.description = e.target.value })}
                        />
                    </Grid>
                    <div>
                        <label>Start Date</label>
                    </div>
                    <div>
                        <input
                            type='datetime-local'
                            placeholder='Add Name'
                            value={dateAsInputString(election.start_time)}
                            onChange={(e) => applyElectionUpdate(election => election.start_time = new Date(e.target.value))}
                        />
                    </div>
                    <div >
                        <label>Stop Date</label>
                    </div>
                    <div>
                        <input
                            type='datetime-local'
                            placeholder='Add Name'
                            value={dateAsInputString(election.end_time)}
                            onChange={(e) => applyElectionUpdate(election => { election.end_time = new Date(e.target.value) })}
                        />
                    </div>
                    <Grid item>
                        <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth>
                                <InputLabel variant="standard" htmlFor="uncontrolled-native">
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
                        </Box>
                    </Grid>
                    {election.settings.election_roll_type === 'None' &&
                        <Grid item>
                            <Box sx={{ minWidth: 120 }}>
                                <FormControl fullWidth>
                                    <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                        Voter ID Type
                                    </InputLabel>
                                    <Select
                                        name="Voter ID"
                                        label="Voter ID"
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
                            </Box>
                        </Grid>

                    }
                    <Grid item>
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
                    <Grid item>
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
                    <Grid item>
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
                    <Grid item>
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
                </div>
            }
        </>
    )
}
