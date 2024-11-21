import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Paper, Select, SelectChangeEvent, TextField } from "@mui/material";
import { useState } from "react";
import useElection from "~/components/ElectionContextProvider";
import { StyledButton } from "~/components/styles";
import { LabelledTextField } from "~/components/util";

export default ({open, onClose, onSubmit, targetedEmail=undefined}) => {
    const [audience, setAudience] = useState(targetedEmail? 'single' : 'all') // TODO: replace this with the official type
    const [template, setTemplate] = useState('invitation') // TODO: replace this with the official type
    const [subject, setSubject] = useState('Update for election') // TODO: replace this with the official type
    const [customMessage, setCustomMessage] = useState('This is an update from the admin') // TODO: replace this with the official type
    const {t} = useElection();

    const SelectField = ({label, value, values, setter, disabled=false}) => 
        <FormControlLabel control={
                <Select value={value} sx={{width: '100%'}} onChange={(ev: SelectChangeEvent) => {
                    setter(ev.target.value as string)}
                }>
                    {values.map((v, i) => <MenuItem key={i} value={v}>{t(`voters.email_form.${v}`, {voter_id: targetedEmail})}</MenuItem>)}
                </Select>
            }
            disabled={disabled}
            label={label}
            labelPlacement='top'
            sx={{
                alignItems: 'start',
                width: {xs: 'unset', md: '400px'}
            }}
        />

    return <Dialog
        open={open}
        onClose={onClose}
    >
        <DialogTitle>Send Email Blast</DialogTitle>
        <DialogContent>
            <Box display='flex' flexDirection='column' gap={3}>
                <SelectField
                    label='Audience'
                    disabled={targetedEmail}
                    value={audience}
                    values={targetedEmail? ['single']: ['all', 'already_voted', 'non_voters']}
                    setter={setAudience}
                />
                <SelectField label='Email Template' values={['invitation', 'receipt', 'blank']} value={template} setter={setTemplate}/>
                <LabelledTextField label='Subject' value={subject} setter={setSubject}/>
                <LabelledTextField label='Custom Message' rows={3} value={customMessage} setter={setCustomMessage}/>
            </Box>
            {/*TODO: remove this warning*/}
            <Paper sx={{background: 'var(--ltbrand-red)', mt: 5, p: 1, width: '400px', mx: 'auto'}}>
                WARNING: The configuration isn't functional yet. Clicking send will send invites to {targetedEmail? targetedEmail : 'everyone'}
            </Paper>
        </DialogContent>
        <DialogActions>
            <Button
                variant="outlined"
                onClick={onClose}>
                {t('ballot.dialog_cancel')}
            </Button>
            <Button
                variant="contained"
                onClick={onSubmit}>
                {targetedEmail? 'Send Email' : 'Send Emails'}
            </Button>
        </DialogActions>
    </Dialog>
}