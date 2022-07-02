import { useState } from "react"
import React from 'react'
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@material-ui/core";

const EditElectionRoll = ({ roll, onClose }) => {
    const [updatedRoll, setUpdatedRoll] = useState(roll)
    const getDateString = (dateNum) => {
        const event = new Date(dateNum);
        return event.toLocaleString();
    }
    return (
        <Container>
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
                {updatedRoll.state !== 'flagged' &&
                    <Grid item sm={4}>
                        <Button variant='outlined' onClick={() => { }} > Flag </Button>
                    </Grid>}
                {updatedRoll.submitted &&
                    <Grid item sm={4}>
                        <Button variant='outlined' onClick={() => { }} > Invalidate Ballot </Button>
                    </Grid>}
                {!updatedRoll.submitted &&
                    <Grid item sm={4}>
                        <Button variant='outlined' onClick={() => { }} > Delete </Button>
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