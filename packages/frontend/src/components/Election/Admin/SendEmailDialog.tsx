import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, MenuItem, Paper, Select, SelectChangeEvent, TextField } from "@mui/material";
import { useState } from "react";
import useAuthSession from "~/components/AuthSessionContextProvider";
import useElection from "~/components/ElectionContextProvider";
import { StyledButton } from "~/components/styles";
import { LabelledTextField } from "~/components/util";

export default ({open, onClose, onSubmit, targetedEmail=undefined}) => {
    const authSession = useAuthSession()
    const [audience, setAudience] = useState(targetedEmail? 'single' : 'all')
    const [template, setTemplate] = useState('invite') 
    const [subject, setSubject] = useState('Update for Election')
    const [customMessage, setCustomMessage] = useState('')
    const [testEmails, setTestEmails] = useState(authSession.getIdField('email')) // TODO: replace this with the official type
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
        <DialogTitle>Prepare Email Blast</DialogTitle>
        <DialogContent>
            <Box display='flex' flexDirection='column' gap={3}>
                <SelectField
                    label='Audience'
                    disabled={targetedEmail}
                    value={audience}
                    values={targetedEmail? ['single']: ['all', 'has_voted', 'has_not_voted']}
                    setter={setAudience}
                />
                <SelectField label='Email Template' values={['invite', 'receipt', 'blank']} value={template} setter={setTemplate}/>
                <LabelledTextField label='Subject' value={subject} setter={setSubject}/>
                <LabelledTextField label='Custom Message' rows={3} value={customMessage} setter={setCustomMessage}/>
                <Divider/>
                {/*<Box display='flex' flexDirection='row' sx={{width: {xs: 'unset', md: '400px'}}}>
                    <LabelledTextField label='Test Email(s)' value={testEmails} setter={setTestEmails}/>
                    {
                        // 56px is to align with text box
                    }
                    <Button variant='contained' sx={{height: '56px', mt: 'auto'}}>Send&nbsp;Test</Button>
                </Box>*/}
            </Box>
        </DialogContent>
        <DialogActions>
            <Button
                variant="outlined"
                onClick={onClose}>
                {t('ballot.dialog_cancel')}
            </Button>
            <Button
                variant="contained"
                onClick={() => onSubmit(
                    template,
                    subject,
                    customMessage,
                    audience,
                )}>
                {targetedEmail? 'Send Email' : 'Send Emails'}
            </Button>
        </DialogActions>
    </Dialog>
}