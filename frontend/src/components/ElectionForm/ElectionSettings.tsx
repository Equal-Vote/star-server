import React, { useContext, useState } from 'react'
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Typography from '@mui/material/Typography';
import { Checkbox, FormGroup, FormHelperText, FormLabel, InputLabel, Radio, RadioGroup, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Box, IconButton } from "@mui/material"
import { StyledButton } from '../styles';
import useElection, { ElectionContext } from '../ElectionContextProvider';
import structuredClone from '@ungap/structured-clone';
import EditIcon from '@mui/icons-material/Edit';

export default function ElectionSettings() {
    const { election, refreshElection, permissions, updateElection } = useElection()

    const [editedElectionSettings, setEditedElectionSettings] = useState(election.settings)

    // const updateVoterAccess = (voter_access) => {
    //     applyElectionUpdate(election => {
    //         election.settings.voter_access = voter_access
    //         if (voter_access === 'open') {
    //             election.settings.voter_authentication.voter_id = false
    //             election.settings.invitations = undefined
    //         }
    //     })
    // }

    const applySettingsUpdate = (updateFunc: (settings) => any) => {
        const settingsCopy = structuredClone(editedElectionSettings)
        updateFunc(settingsCopy)
        setEditedElectionSettings(settingsCopy)
    };

    const validatePage = () => {
        // Placeholder function
        return true
    }

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const onSave = () => {
        if(!validatePage()) return
        handleClose()
    }

    return (
        <Paper elevation={3}>
            <Box
                sx={{ display: 'flex',  bgcolor: 'background.paper', borderRadius: 10 }}
                alignItems={'center'}
            >
                <Box sx={{ width: '100%', pl:2}}>
                    <Typography variant="h4" component="h4">Extra Settings</Typography>
                </Box>
                <Box sx={{ flexShrink: 1, p: 1 }}>
                    <IconButton
                        aria-label="edit"
                        onClick={handleOpen}>
                        <EditIcon />
                    </IconButton>
                </Box>
            </Box>
            <Dialog
                open={open}
                onClose={handleClose}
            >
                <DialogTitle> Election Settings</DialogTitle>
                <DialogContent>
                    {/* <Grid item xs={11} sx={{ m: 0, p: 1 }}>
                <Typography gutterBottom variant="h4" component="h4">Election Settings</Typography>
            </Grid> */}
                    {/* <Grid item xs={12} sx={{ m: 0, my: 1, p: 1 }}>
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
                                value={editedElectionSettings.voter_access}
                                onChange={(e) => applySettingsUpdate(settings => settings.voter_access = e.target.value)}
                            >
                                <FormControlLabel value="open" control={<Radio />} label="Open" sx={{ mb: 0, pb: 0 }} />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Open to authenticated voters
                                </FormHelperText>
                                <FormControlLabel value="closed" control={<Radio />} label="Closed" />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Restricted to a predefined list of voters
                                </FormHelperText>
                                <Tooltip title="Voters must first register to cast a provisional ballot and credentialer must approve each voter">
                                    <FormControlLabel value="registration" control={<Radio />} label="Registration" />

                                </Tooltip>
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Registered and approved
                                </FormHelperText>
                            </RadioGroup>
                        </FormControl>


                    </Grid>
                    <Grid item xs={12} sx={{ m: 0, my: 1, p: 1 }}>
                        <FormControl component="fieldset" variant="standard">
                            <FormLabel component="legend">Voter Authentication</FormLabel>
                            <FormHelperText>
                                How do you want to authenticate your voters?
                            </FormHelperText>
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            id="ip-address"
                                            name="IP Address"
                                            checked={editedElectionSettings.voter_authentication?.ip_address}
                                            onChange={(e) => applySettingsUpdate(settings => { settings.voter_authentication.ip_address = e.target.checked })}
                                        />
                                    }
                                    label="IP Address"
                                />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Limits to one vote per IP address
                                </FormHelperText>
                                <FormControlLabel control={
                                    <Checkbox
                                        id="email"
                                        name="Email"
                                        checked={editedElectionSettings.voter_authentication?.email}
                                        onChange={(e) => applySettingsUpdate(settings => { settings.voter_authentication.email = e.target.checked })}
                                    />}
                                    label="Email"
                                />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Voters must be logged in with a validated email address
                                </FormHelperText>
                                <FormControlLabel
                                    disabled={editedElectionSettings.voter_access === 'open'}
                                    control={
                                        <Checkbox
                                            id="voter-id"
                                            name="Voter ID"
                                            checked={editedElectionSettings.voter_authentication?.voter_id}
                                            onChange={(e) => applySettingsUpdate(settings => { settings.voter_authentication.voter_id = e.target.checked })}
                                        />}
                                    label="Voter ID"
                                />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Voters must enter a voter ID code provided to them by election host
                                </FormHelperText>
                            </FormGroup>
                        </FormControl>

                    </Grid> */}
                    <Grid item xs={12} sx={{ m: 0, my: 1, p: 1 }}>
                        <FormControl component="fieldset" variant="standard">
                            {/* <FormLabel component="legend">Miscellaneous Settings</FormLabel> */}
                            <FormGroup>
                                <FormControlLabel disabled control={
                                    <Checkbox
                                        id="ballot-updates"
                                        name="Ballot Updates"
                                        checked={editedElectionSettings.ballot_updates}
                                        onChange={(e) => applySettingsUpdate(settings => { settings.ballot_updates = e.target.checked })}
                                    />}
                                    label="Ballot Updates"
                                />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Allow voters to update their ballots while election is still open (currently not supported)
                                </FormHelperText>
                                <FormControlLabel control={
                                    <Checkbox
                                        id="public-results"
                                        name="Public Results"
                                        checked={editedElectionSettings.public_results}
                                        onChange={(e) => applySettingsUpdate(settings => { settings.public_results = e.target.checked })}
                                    />}
                                    label="Public Results"
                                />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Allow voters to view preliminary results. (Administrators can make results public at any time.)
                                </FormHelperText>
                                <FormControlLabel
                                    disabled={true}
                                    control={
                                        <Checkbox
                                            id="random-ties"
                                            name="Enable Random Tie-Breakers"
                                            checked={true}
                                            // onChange={(e) => applySettingsUpdate(settings => { settings.invitation = e.target.checked ? 'email' : undefined })}
                                        />}
                                    label="Enable Random Tie-Breakers"
                                />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    While ties are unlikely, yada yada yada, Link to info on ties.
                                </FormHelperText>
                                <FormControlLabel
                                    disabled={true}
                                    control={
                                        <Checkbox
                                            id="voter-groups"
                                            name="Enable Voter Groups"
                                            checked={false}
                                            // onChange={(e) => applySettingsUpdate(settings => { settings.invitation = e.target.checked ? 'email' : undefined })}
                                        />}
                                    label="Enable Voter Groups"
                                />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Manage which races voters can vote in.
                                </FormHelperText>
                                <FormControlLabel
                                    disabled={true}
                                    control={
                                        <Checkbox
                                            id="custom-email-text"
                                            name="Custom Email Invite Text"
                                            checked={false}
                                            // onChange={(e) => applySettingsUpdate(settings => { settings.invitation = e.target.checked ? 'email' : undefined })}
                                        />}
                                    label="Custom Email Invite Text"
                                />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Set greetings and instructions for your email invitations. 
                                </FormHelperText>
                                <FormControlLabel
                                    disabled={true}
                                    control={
                                        <Checkbox
                                            id="require-instructions-confirmations"
                                            name="Require Instruction Confirmations"
                                            checked={false}
                                            // onChange={(e) => applySettingsUpdate(settings => { settings.invitation = e.target.checked ? 'email' : undefined })}
                                        />}
                                    label="Require Instruction Confirmations"
                                />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Requires voters to confirm that they have read ballot instructions in order to vote. 
                                </FormHelperText>
                            </FormGroup>
                        </FormControl>
                    </Grid >
                    {/* <Grid item xs={3} sx={{ m: 0, p: 1, pt: 2 }}>
                        <StyledButton
                            type='button'
                            variant="contained"
                            width="100%"
                            onClick={() => {
                                if (validatePage()) {
                                    // setPageNumber(pageNumber => pageNumber - 1)
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
                            onClick={() => {
                                if (validatePage()) {
                                    // setPageNumber(pageNumber => pageNumber + 1)
                                }
                            }}>
                            Next
                        </StyledButton>
                    </Grid> */}
                </DialogContent>
                
                <DialogActions>
                        <StyledButton
                            type='button'
                            variant="contained"
                            width="100%"
                            fullWidth={false}
                            onClick={handleClose}>
                            Cancel
                        </StyledButton>
                        <StyledButton
                            type='button'
                            variant="contained"
                            fullWidth={false}
                            onClick={() => onSave()}>
                            Save
                        </StyledButton>
                    </DialogActions>
            </Dialog>
        </Paper>
    )
}
