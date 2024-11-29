import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, MenuItem, Paper, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { useState } from "react";
import useAuthSession from "~/components/AuthSessionContextProvider";
import useElection from "~/components/ElectionContextProvider";
import { StyledButton } from "~/components/styles";
import { LabelledTextField, RowButtonWithArrow } from "~/components/util";

export default ({open, onClose, onSubmit, targetedEmail=undefined}) => {
    const authSession = useAuthSession()
    const [audience, setAudience] = useState(targetedEmail? 'single' : 'all')
    const [template, setTemplate] = useState(null) 
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

    const close = () => {
        setTemplate(null)
        onClose()
    }

    //<SelectField label='Template' values={['invite', 'receipt', 'blank']} value={template} setter={setTemplate}/>
    return <Dialog
        open={open}
        onClose={close}
    >
        <DialogTitle>Prepare Email Blast</DialogTitle>
        <DialogContent>
            <Box display='flex' flexDirection='row'>
                <Box display='flex' flexDirection='row-reverse' sx={{
                    width: template !== null ? 0 : '465px', // 100 is copied from auto
                    height: 'auto',
                    opacity: template !== null ? 0 : 1, 
                    overflow: 'hidden',
                    transition: 'width .4s, opacity .7s',
                    mb: '20px'
                }}>
                    <Box display='flex' flexDirection={'column'} sx={{minWidth: '465px'}}>
                        <Typography>Which template would you like to start with?</Typography>
                        {['invite', 'receipt', 'blank'].map((v, i) => 
                            <RowButtonWithArrow
                                key={i}
                                title={t(`voters.email_form.${v}`, {voter_id: targetedEmail})}
                                onClick={() => setTemplate(v)}
                            />
                        )}
                    </Box>
                </Box>
                <Box display='flex' flexDirection='column' gap={3} sx={{
                    width: template === null ? 0 : '465px', // 465 is copied from auto
                    opacity: template === null ? 0 : 1, 
                    overflow: 'hidden',
                    transition: 'width .4s, opacity .7s',
                }}>
                    <SelectField
                        label='Audience'
                        disabled={targetedEmail}
                        value={audience}
                        values={targetedEmail? ['single']: ['all', 'has_voted', 'has_not_voted']}
                        setter={setAudience}
                    />
                    <LabelledTextField label='Subject' value={subject} setter={setSubject}/>
                    <LabelledTextField label='Custom Message' rows={3} value={customMessage} setter={setCustomMessage}/>
                    <Divider/>
                    <Box display='flex' flexDirection='row' sx={{width: {xs: 'unset', md: '400px'}}}>
                        <LabelledTextField label='Test Email(s)' value={testEmails} setter={setTestEmails}/>
                        {
                            // 56px is to align with text box
                        }
                        <Button variant='contained' sx={{height: '56px', mt: 'auto'}}>Send&nbsp;Test</Button>
                    </Box>
                </Box>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button
                variant="outlined"
                onClick={close}>
                {t('ballot.dialog_cancel')}
            </Button>
            <Button
                variant="contained"
                disabled={template === null}
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