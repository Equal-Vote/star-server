import { useState, useContext } from "react"
import React from 'react'
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip } from "@mui/material";
import PermissionHandler from "../../PermissionHandler";
import { useApproveRoll, useFlagRoll, useInvalidateRoll, useSendEmails, useSendInvite, useUnflagRoll } from "../../../hooks/useAPI";
import { getLocalTimeZoneShort, useSubstitutedTranslation } from "../../util";
import useElection from "../../ElectionContextProvider";
import useFeatureFlags from "../../FeatureFlagContextProvider";
import { ElectionRoll } from "@equal-vote/star-vote-shared/domain_model/ElectionRoll";
import SendEmailDialog from "./SendEmailDialog";
import { email_request_data } from "@equal-vote/star-vote-backend/src/Controllers/Election/sendEmailController";
import { SettingsBackupRestore } from "@mui/icons-material";
import useSnackbar from "~/components/SnackbarContext";


type Props = {
    roll: ElectionRoll,
    onClose: Function,
    fetchRolls: Function,
  }
const EditElectionRoll = ({ roll, onClose, fetchRolls }:Props) => {
    const { t, election, permissions } = useElection()
    const [updatedRoll, setUpdatedRoll] = useState(roll)
    const flags = useFeatureFlags();
    const [dialogOpen, setDialogOpen] = useState(false);

    const approve = useApproveRoll(election.election_id)
    const flag = useFlagRoll(election.election_id)
    const unflag = useUnflagRoll(election.election_id)
    const invalidate = useInvalidateRoll(election.election_id)
    const sendEmails = useSendEmails(election.election_id)
    const { setSnack } = useSnackbar();

    const onApprove = async () => {
        if (!await approve.makeRequest({ electionRollEntry: roll })) { return }
        await fetchRolls()
    }
    const onFlag = async () => {
        if (!await flag.makeRequest({ electionRollEntry: roll })) { return }
        await fetchRolls()
    }
    const onUnflag = async () => {
        if (!await unflag.makeRequest({ electionRollEntry: roll })) { return }
        await fetchRolls()
    }
    const onInvalidate = async () => {
        if (!await invalidate.makeRequest({ electionRollEntry: roll })) { return }
        await fetchRolls()
    }
    const onSendEmail = async ({
        subject,
        body,
        target,
        testEmails,
    } : {
        subject: string,
        body: string,
        target: 'all' | 'has_voted' | 'has_not_voted' | 'single' | 'test'
        testEmails: string[],
    }) => {
        setDialogOpen(false);

        if (!await sendEmails.makeRequest({
            target: target,
            email: { subject, body },
            voter_id: roll.voter_id,
        })) return; 

        await fetchRolls()
    }

    return (
        <Container>
            {(approve.isPending || flag.isPending || unflag.isPending || invalidate.isPending) &&
                <div> Sending Request... </div>}
            <Grid container direction="column" >
                {roll.email &&
                    <Grid item sm={12}>
                        <Typography align='left' gutterBottom variant="h6" component="h6">
                            {`Email Address: ${roll.email}`}
                        </Typography>
                    </Grid>
                }
                <Grid item sm={12}>
                    <Typography align='left' gutterBottom variant="h6" component="h6">
                        {`Has Voted: ${roll.submitted.toString()}`}
                    </Typography>
                </Grid>
                <Grid item sm={12}>
                    <Typography align='left' gutterBottom variant="h6" component="h6">
                        {`State: ${roll.state}`}
                    </Typography>
                </Grid>
                
                {election.settings.invitation === 'email' && roll.email &&
                    <>
                        {roll && !(roll.email_data && roll.email_data.inviteResponse) &&
                            <Grid item sm={12}>
                                <Typography align='left' gutterBottom variant="h6" component="h6">
                                    {`Email invite status: Invite not sent`}
                                </Typography>
                            </Grid>
                        }
                        {roll && (roll.email_data && roll.email_data.inviteResponse) && (roll.email_data.inviteResponse.length > 0 && roll.email_data.inviteResponse[0].statusCode < 400) &&
                            <Grid item sm={12}>
                                <Typography align='left' gutterBottom variant="h6" component="h6">
                                    {`Email invite status: Success`}
                                </Typography>
                            </Grid>
                        }
                        {roll && (roll.email_data && roll.email_data.inviteResponse) && !(roll.email_data.inviteResponse.length > 0 && roll.email_data.inviteResponse[0].statusCode < 400) &&
                            <Grid item sm={12}>
                                <Typography align='left' gutterBottom variant="h6" component="h6">
                                    {`Email invite status: Failed`}
                                </Typography>
                                <Typography align='left' gutterBottom component="p">
                                    {`Debug Info: ${JSON.stringify(roll.email_data.inviteResponse)}`}
                                </Typography>
                            </Grid>
                        }
                        <Grid item sm={4} sx={{py:1}}>
                            <PermissionHandler permissions={permissions} requiredPermission={'canSendEmails'}>
                                <Button variant='outlined' onClick={() => { setDialogOpen(true) }} > Draft Email </Button>
                            </PermissionHandler>
                        </Grid>
                        <Box sx={{pb:3, display: 'flex', flexDirection: 'column'}}>
                            <Button variant='outlined' sx={{maxWidth: '250px'}} onClick={() => {
                                    navigator.clipboard.writeText(window.location.origin+'/'+election.election_id+'/id/'+roll.voter_id)
                                    setSnack({
                                        message: 'Unique URL Copied!',
                                        severity: 'success',
                                        open: true,
                                        autoHideDuration: 6000,
                                    })
                                }}
                            > Copy Unique Voting URL </Button>
                            <Typography component='p'>(action will be captured in audit log)</Typography>
                        </Box>
                    </>
                }
                {roll.state === 'registered' &&
                    <Grid item sm={4} sx={{py:1}}>
                        <PermissionHandler permissions={permissions} requiredPermission={'canApproveElectionRoll'}>
                            <Button variant='outlined' onClick={() => { onApprove() }} > Approve </Button>
                        </PermissionHandler>
                    </Grid>}
                {flags.isSet('VOTER_FLAGGING') && <>
                    {roll.state !== 'flagged' &&
                        <Grid item sm={4} sx={{py:1}}>

                            <PermissionHandler permissions={permissions} requiredPermission={'canFlagElectionRoll'}>
                                <Button variant='outlined' onClick={() => { onFlag() }} > Flag </Button>
                            </PermissionHandler>
                        </Grid>}
                    {roll.state === 'flagged' &&
                        <Grid item sm={4} sx={{py:1}}>
                            <PermissionHandler permissions={permissions} requiredPermission={'canUnflagElectionRoll'}>
                                <Button variant='outlined' onClick={() => { onUnflag() }} > Unflag </Button>
                            </PermissionHandler>
                        </Grid>}
                    {roll.state === 'flagged' &&
                        <Grid item sm={4} sx={{py:1}}>
                            <PermissionHandler permissions={permissions} requiredPermission={'canInvalidateElectionRoll'}>
                                <Button variant='outlined' onClick={() => { onInvalidate() }} > Invalidate </Button>
                            </PermissionHandler>
                        </Grid>}
                </>}
                {roll?.history &&
                    <TableContainer component={Paper}>
                        <Table style={{ width: '100%' }} aria-label="simple table">
                            <TableHead>
                                <TableCell> Action </TableCell>
                                <TableCell align="right"> Actor </TableCell>
                                <TableCell align="right"> {`Timestamp (${getLocalTimeZoneShort()})`} </TableCell>
                            </TableHead>
                            <TableBody>
                                {roll.history.map((history, i) => (
                                    <TableRow key={i} >
                                        <TableCell component="th" scope="row">
                                            {history.action_type}
                                        </TableCell>
                                        <TableCell align="right" >{history.actor}</TableCell>
                                        <TableCell align="right" >{ t('listed_datetime', {listed_datetime: history.timestamp} )}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                }
                <Grid item sm={4}>
                    <Button variant='outlined' onClick={() => { onClose() }} > Close </Button>
                </Grid>
            </Grid>
            <SendEmailDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={onSendEmail}
                targetedEmail={roll.email}
            />
        </Container>
    )
}

export default EditElectionRoll 
