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

    const onSave = async () => {
        if (!validatePage()) return
        const success = await updateElection(election => {
            election.settings = editedElectionSettings
        })
        if (!success) return false
        await refreshElection()
        handleClose()
    }

    return (
        <Paper elevation={3}>
            <Box
                sx={{ display: 'flex', bgcolor: 'background.paper', borderRadius: 10 }}
                alignItems={'center'}
            >
                <Box sx={{ width: '100%', pl: 2 }}>
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
                    <Grid item xs={12} sx={{ m: 0, my: 1, p: 1 }}>
                        <FormControl component="fieldset" variant="standard">
                            <FormGroup>
                                <FormControlLabel control={
                                    <Checkbox
                                        id="candidate-order"
                                        name="Randomize Candidate Order"
                                        checked={editedElectionSettings.random_candidate_order}
                                        onChange={(e) => applySettingsUpdate(settings => { settings.random_candidate_order = e.target.checked })}
                                    />}
                                    label="Randomize Candidate Order"
                                />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Randomizes the order of candidates on the ballots.
                                </FormHelperText>
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
                                        />}
                                    label="Custom Email Invite Text"
                                />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Set greetings and instructions for your email invitations.
                                </FormHelperText>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            id="require-instructions-confirmations"
                                            name="Require Instruction Confirmations"
                                            checked={editedElectionSettings.require_instruction_confirmation}
                                            onChange={(e) => applySettingsUpdate(settings => { settings.require_instruction_confirmation = e.target.checked })}
                                        />}
                                    label="Require Instruction Confirmations"
                                />
                                <FormHelperText sx={{ pl: 4, mt: -1 }}>
                                    Requires voters to confirm that they have read ballot instructions in order to vote.
                                </FormHelperText>
                            </FormGroup>
                        </FormControl>
                    </Grid >
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
