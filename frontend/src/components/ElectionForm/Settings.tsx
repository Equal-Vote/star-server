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
import { Box, Checkbox, FormGroup, FormHelperText, FormLabel, InputLabel, Radio, RadioGroup, Tooltip } from "@mui/material"
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

    const updateVoterAccess = (voter_access) => {
        applyElectionUpdate(election => {
            election.settings.voter_access = voter_access
            if (voter_access === 'open') {
                election.settings.voter_authentication.voter_id = false
                election.settings.invitations = undefined
            }
        })
    }


    return (
        <>
            <Grid item xs={11} sx={{ m: 0, p: 1}}>
                <Typography gutterBottom variant="h4" component="h4">Election Settings</Typography>
            </Grid>
            <Grid item xs={12} sx={{ m: 0, p: 1}}>
                <FormControl component="fieldset" variant="standard">
                    <FormLabel id="voter-access">
                        Voter Access
                    </FormLabel>
                    <FormHelperText>
                        Who do you want to have access to your election?
                    </FormHelperText>
                    <RadioGroup
                        aria-labelledby="voter-access-radio-group"
                        name="voter-access-radio-buttons-group"
                        value={election.settings.voter_access}
                        onChange={(e) => updateVoterAccess(e.target.value)}
                    >
                        <Tooltip title="Open to all authenticated voters">
                            <FormControlLabel value="open" control={<Radio />} label="Open" />
                        </Tooltip>
                        <Tooltip title="Closed to only a predefined list of voters">
                            <FormControlLabel value="closed" control={<Radio />} label="Closed" />
                        </Tooltip>
                        <Tooltip title="Voters must first register to cast a provisional ballot and credentialer must approve each voter">
                            <FormControlLabel value="registration" control={<Radio />} label="Registration" />
                        </Tooltip>
                    </RadioGroup>
                </FormControl>


            </Grid>
            <Grid item xs={12} sx={{ m: 0, p: 1}}>
                <FormControl component="fieldset" variant="standard">
                    <FormLabel component="legend">Voter Authentication</FormLabel>
                    <FormHelperText>
                        How do you want to authenticate your voters?
                    </FormHelperText>
                    <FormGroup>
                        <Tooltip title="Limits to one vote per IP address">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        id="ip-address"
                                        name="IP Address"
                                        checked={election.settings.voter_authentication?.ip_address}
                                        onChange={(e) => applyElectionUpdate(election => { election.settings.voter_authentication.ip_address = e.target.checked })}
                                    />
                                }
                                label="IP Address"
                            />
                        </Tooltip>
                        <Tooltip title="Voters must be logged in with a validated email address">
                            <FormControlLabel control={
                                <Checkbox
                                    id="email"
                                    name="Email"
                                    checked={election.settings.voter_authentication?.email}
                                    onChange={(e) => applyElectionUpdate(election => { election.settings.voter_authentication.email = e.target.checked })}
                                />}
                                label="Email"
                            />
                        </Tooltip>
                        <Tooltip title="Voter's must enter a voter ID code provided to them by election host">
                            <FormControlLabel
                                disabled={election.settings.voter_access === 'open'}
                                control={
                                    <Checkbox
                                        id="voter-id"
                                        name="Voter ID"
                                        checked={election.settings.voter_authentication?.voter_id}
                                        onChange={(e) => applyElectionUpdate(election => { election.settings.voter_authentication.voter_id = e.target.checked })}
                                    />}
                                label="Voter ID"
                            />
                        </Tooltip>
                    </FormGroup>
                </FormControl>

            </Grid>
            <Grid item xs={12} sx={{ m: 0, p: 1}}>
                <FormControl component="fieldset" variant="standard">
                    <FormLabel component="legend">Miscellaneous Settings</FormLabel>
                    <FormGroup>
                        <Tooltip title="Allow voters to update their ballot while election is still open, currently not supported">
                            <FormControlLabel disabled control={
                                <Checkbox
                                    id="ballot-updates"
                                    name="Ballot Updates"
                                    checked={election.settings.ballot_updates}
                                    onChange={(e) => applyElectionUpdate(election => { election.settings.ballot_updates = e.target.checked })}
                                />}
                                label="Ballot Updates"
                            />
                        </Tooltip>
                        <Tooltip title="Allow voters to view preliminary results. If disabled, admin will have option to make results public at any time">
                            <FormControlLabel control={
                                <Checkbox
                                    id="public-results"
                                    name="Public Results"
                                    checked={election.settings.public_results}
                                    onChange={(e) => applyElectionUpdate(election => { election.settings.public_results = e.target.checked })}
                                />}
                                label="Public Results"
                            />
                        </Tooltip>
                        <Tooltip title="If email address's are provided, email invitations will be sent once election is finalized">
                            <FormControlLabel
                                disabled={election.settings.voter_access !== 'closed'}
                                control={
                                    <Checkbox
                                        id="invitation"
                                        name="Invitation"
                                        checked={election.settings.invitation !== undefined}
                                        onChange={(e) => applyElectionUpdate(election => { election.settings.invitation = e.target.checked ? 'email' : undefined })}
                                    />}
                                label="Email Invitations"
                            />
                        </Tooltip>
                    </FormGroup>
                </FormControl>
            </Grid >
        </>
    )
}
