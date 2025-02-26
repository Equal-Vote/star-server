import React, { useContext, useState } from 'react'
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Typography from '@mui/material/Typography';
import { Checkbox, FormGroup, FormHelperText, FormLabel, InputLabel, Radio, RadioGroup, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Box, IconButton, TextField } from "@mui/material"
import { PrimaryButton } from '../styles';
import useElection  from '../ElectionContextProvider';
import structuredClone from '@ungap/structured-clone';
import EditIcon from '@mui/icons-material/Edit';
import { useSubstitutedTranslation } from '../util';
import { ElectionSettings as IElectionSettings, electionSettingsValidation } from '@equal-vote/star-vote-shared/domain_model/ElectionSettings';
import useSnackbar from '../SnackbarContext';

export default function ElectionSettings() {
    const { election, refreshElection, permissions, updateElection } = useElection()
    const { setSnack } = useSnackbar()
    const min_rankings = 3;
    const max_rankings = Number(process.env.REACT_APP_MAX_BALLOT_RANKS) ? Number(process.env.REACT_APP_MAX_BALLOT_RANKS) : 8;
    const default_rankings = Number(process.env.REACT_APP_DEFAULT_BALLOT_RANKS) ? Number(process.env.REACT_APP_DEFAULT_BALLOT_RANKS) : 6;

    const {t} = useSubstitutedTranslation(election.settings.term_type, {min_rankings, max_rankings});

    const [editedElectionSettings, setEditedElectionSettings] = useState(election.settings)
    let [editedIsPublic, setEditedIsPublic] = useState(election.is_public)

    const applySettingsUpdate = (updateFunc: (settings: IElectionSettings) => any) => {
        const settingsCopy = structuredClone(editedElectionSettings)
        updateFunc(settingsCopy)
        setEditedElectionSettings(settingsCopy)
    };

    const validatePage = (electionSettings:IElectionSettings) => {
        // Placeholder function
        return electionSettingsValidation(electionSettings)
    }

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const onSave = async () => {
        if (validatePage(editedElectionSettings)) {
            setSnack({
                message: validatePage(editedElectionSettings),
                severity: 'error',
                open: true,
                autoHideDuration: 6000,
            })
            return false
        }
        const success = await updateElection(election => {
            election.settings = editedElectionSettings
            election.is_public = editedIsPublic
        })
        if (!success) return false
        await refreshElection()
        handleClose()
    }

    const CheckboxSetting = ({setting, disabled=false, checked=undefined, onChange=undefined}) => <>
        <FormControlLabel disabled={disabled} control={
            <Checkbox
                id={setting}
                name={t(`election_settings.${setting}`)}
                checked={disabled? !!checked : (checked ?? !!editedElectionSettings[setting])}
                onChange={onChange ?? ((e) => applySettingsUpdate(settings => { settings[setting] = e.target.checked; }))}
                sx={{mb: 1}}
            />}
            label={t(`election_settings.${setting}`)}
        />
    </>;

    return (
        <Paper elevation={3} sx={{width: '100%', px: 4, py: 1}}>
            <Box
                sx={{ display: 'flex', bgcolor: 'background.paper', borderRadius: 10 }}
                alignItems={'center'}
            >
                <Box sx={{ width: '100%', pl: 2 }}>
                    <Typography variant="h4" component="h4">{t('election_settings.button_title')}</Typography>
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
                <DialogTitle sx={{m: 0}}>{t('election_settings.dialog_title')}</DialogTitle>
                <DialogContent>
                    <Grid item xs={12} sx={{ m: 0, my: 0, p: 1 }}>
                        <FormControl component="fieldset" variant="standard">
                            <FormGroup>
                                <FormControlLabel control={
                                    <TextField
                                        id="contact_email"
                                        name={t(`election_settings.contact_email`)}
                                        value={editedElectionSettings.contact_email ? editedElectionSettings.contact_email : ''}
                                        onChange={(e) => applySettingsUpdate((settings) => { settings.contact_email = e.target.value })}
                                        variant='standard'
                                        sx={{ mt: -1, display: 'block'}}
                                    />}
                                    label={t(`election_settings.contact_email`)}
                                    labelPlacement='top'
                                    sx={{
                                        alignItems: 'start'
                                    }}
                                />
                                <br/>

                                <CheckboxSetting setting='random_candidate_order'/>
                                <CheckboxSetting setting='ballot_updates' disabled/>
                                <CheckboxSetting setting='public_results'/>
                                <CheckboxSetting setting='random_ties' disabled checked/>
                                <CheckboxSetting setting='voter_groups' disabled/>
                                <CheckboxSetting setting='custom_email_invite' disabled/>
                                <CheckboxSetting setting='require_instruction_confirmation'/>
                                <CheckboxSetting setting='publicly_searchable' checked={editedIsPublic === true} onChange={(e) => setEditedIsPublic(e.target.checked)}/>
                                <CheckboxSetting setting='max_rankings' onChange={(e) => applySettingsUpdate(settings => {
                                    settings.max_rankings = e.target.checked ? default_rankings : undefined })
                                }/>

                                <TextField
                                    id="rank-limit"
                                    type="number"
                                    value={editedElectionSettings.max_rankings ? editedElectionSettings.max_rankings : default_rankings}
                                    onChange={(e) => applySettingsUpdate((settings) => { settings.max_rankings = Number(e.target.value) })}
                                    variant='standard'
                                    InputProps={{ inputProps: { min: min_rankings, max: max_rankings } }}
                                    sx={{ pl: 4, mt: -1, display: 'block'}}
                                    disabled={!editedElectionSettings.max_rankings}
                                />

                                
                            </FormGroup>
                        </FormControl>
                    </Grid >
                </DialogContent>
                <DialogActions>
                    <PrimaryButton
                        type='button'
                        variant="contained"
                        width="100%"
                        fullWidth={false}
                        onClick={handleClose}
                    >
                        {t('keyword.cancel')}
                    </PrimaryButton>
                    <PrimaryButton
                        type='button'
                        variant="contained"
                        fullWidth={false}
                        onClick={() => onSave()}
                    >
                        {t('keyword.save')}
                    </PrimaryButton>
                </DialogActions>
            </Dialog>
        </Paper>
    )
}
