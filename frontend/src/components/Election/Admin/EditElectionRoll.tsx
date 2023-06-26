import { useState } from "react"
import React from 'react'
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import PermissionHandler from "../../PermissionHandler";
import { useApproveRoll, useFlagRoll, useInvalidateRoll, useUnflagRoll } from "../../../hooks/useAPI";
import useFetch from "../../../hooks/useFetch";

const EditElectionRoll = ({ roll, onClose, fetchRolls, id, permissions }) => {
    const [updatedRoll, setUpdatedRoll] = useState(roll)

    const approve = useApproveRoll(id)
    const flag = useFlagRoll(id)
    const unflag = useUnflagRoll(id)
    const invalidate = useInvalidateRoll(id)
    const sendInvite = useFetch(`/API/Election/${id}/sendInvite/${roll.voter_id}`, 'post') // TODO: move to useAPI

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
    const onSendInvite = async () => {
        if (!await sendInvite.makeRequest()) { return }
        await fetchRolls()
    }


    const getDateString = (dateNum) => {
        const event = new Date(dateNum);
        return event.toLocaleString();
    }
    return (
        <Container>
            {(approve.isPending || flag.isPending || unflag.isPending || invalidate.isPending) &&
                <div> Sending Request... </div>}
            <Grid container direction="column" >
                <Grid item sm={12}>
                    <Typography align='left' gutterBottom variant="h6" component="h6">
                        {`Voter ID: ${roll.voter_id}`}
                    </Typography>
                </Grid>
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
                
                {roll.email &&
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
                                <Button variant='outlined' onClick={() => { onSendInvite() }} > Send Invite </Button>
                            </PermissionHandler>
                        </Grid>
                    </>
                }
                {roll.state === 'registered' &&
                    <Grid item sm={4} sx={{py:1}}>
                        <PermissionHandler permissions={permissions} requiredPermission={'canApproveElectionRoll'}>
                            <Button variant='outlined' onClick={() => { onApprove() }} > Approve </Button>
                        </PermissionHandler>
                    </Grid>}
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


                {roll?.history &&
                    <TableContainer component={Paper}>
                        <Table style={{ width: '100%' }} aria-label="simple table">
                            <TableHead>
                                <TableCell> Action </TableCell>
                                <TableCell align="right"> Actor </TableCell>
                                <TableCell align="right"> Timestamp </TableCell>
                            </TableHead>
                            <TableBody>
                                {roll.history.map((history, i) => (
                                    <TableRow key={i} >
                                        <TableCell component="th" scope="row">
                                            {history.action_type}
                                        </TableCell>
                                        <TableCell align="right" >{history.actor}</TableCell>
                                        <TableCell align="right" >{getDateString(history.timestamp)}</TableCell>
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
        </Container>
    )
}

export default EditElectionRoll 