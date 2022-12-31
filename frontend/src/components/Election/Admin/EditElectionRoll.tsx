import { useState } from "react"
import React from 'react'
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import useFetch from "../../../hooks/useFetch";
import PermissionHandler from "../../PermissionHandler";

const EditElectionRoll = ({ roll, onClose, fetchRolls, id, permissions }) => {
    const [updatedRoll, setUpdatedRoll] = useState(roll)

    const approve = useFetch(`/API/Election/${id}/rolls/approve`, 'post')
    const flag = useFetch(`/API/Election/${id}/rolls/flag`, 'post')
    const unflag = useFetch(`/API/Election/${id}/rolls/unflag`, 'post')
    const invalidate = useFetch(`/API/Election/${id}/rolls/invalidate`, 'post')

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
                        {`Voter ID: ${updatedRoll.voter_id}`}
                    </Typography>
                </Grid>
                <Grid item sm={12}>
                    <Typography align='left' gutterBottom variant="h6" component="h6">
                        {`Has Voted: ${updatedRoll.submitted.toString()}`}
                    </Typography>
                </Grid>
                {updatedRoll.state === 'registered' &&
                    <Grid item sm={4}>
                        <PermissionHandler permissions={permissions} requiredPermission={'canApproveElectionRoll'}>
                            <Button variant='outlined' onClick={() => { onApprove() }} > Approve </Button>
                        </PermissionHandler>
                    </Grid>}
                {updatedRoll.state !== 'flagged' &&
                    <Grid item sm={4}>

                        <PermissionHandler permissions={permissions} requiredPermission={'canFlagElectionRoll'}>
                            <Button variant='outlined' onClick={() => { onFlag() }} > Flag </Button>
                        </PermissionHandler>
                    </Grid>}
                {updatedRoll.state === 'flagged' &&
                    <Grid item sm={4}>
                        <PermissionHandler permissions={permissions} requiredPermission={'canUnflagElectionRoll'}>
                            <Button variant='outlined' onClick={() => { onUnflag() }} > Unflag </Button>
                        </PermissionHandler>
                    </Grid>}
                {updatedRoll.state === 'flagged' &&
                    <Grid item sm={4}>
                        <PermissionHandler permissions={permissions} requiredPermission={'canInvalidateElectionRoll'}>
                            <Button variant='outlined' onClick={() => { onInvalidate() }} > Invalidate </Button>
                        </PermissionHandler>
                    </Grid>}
                {updatedRoll?.history &&
                    <TableContainer component={Paper}>
                        <Table style={{ width: '100%' }} aria-label="simple table">
                            <TableHead>
                                <TableCell> Action </TableCell>
                                <TableCell align="right"> Actor </TableCell>
                                <TableCell align="right"> Timestamp </TableCell>
                            </TableHead>
                            <TableBody>
                                {updatedRoll.history.map((history, i) => (
                                    <TableRow key={i} >
                                        <TableCell component="th" scope="row">
                                            {history.action}
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