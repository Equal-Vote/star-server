import { useState } from "react"
import React from 'react'
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import useFetch from "../../../hooks/useFetch";
import PermissionHandler from "../../PermissionHandler";

const ViewBallot = ({ election, ballot, onClose, fetchRolls, id, permissions }) => {

    const getDateString = (dateNum) => {
        const event = new Date(dateNum);
        return event.toLocaleString();
    }
    return (
        <Container>
            <Grid container direction="column" >
                <Grid item sm={12}>
                    <Typography align='left' variant="h6" component="h6">
                        {`Ballot ID: ${ballot.ballot_id}`}
                    </Typography>
                </Grid>
                {ballot.precinct &&
                    <Grid item sm={12}>
                        <Typography align='left' variant="h6" component="h6">
                            {`Precinct: ${ballot.precinct}`}
                        </Typography>
                    </Grid>
                }
                <Grid item sm={12}>
                    <Typography align='left' variant="h6" component="h6">
                        {`Date Submitted: ${getDateString(Number(ballot.date_submitted))}`}
                    </Typography>
                </Grid>
                <Grid item sm={12}>
                    <Typography align='left' variant="h6" component="h6">
                        {`Status: ${ballot.status}`}
                    </Typography>
                </Grid>
                {ballot.votes.map((vote, v) => (
                    <>

                        <Typography align='left' variant="h6" component="h6">
                            {election.races[v].title}
                        </Typography>


                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableCell> Candidate </TableCell>
                                    <TableCell> Score </TableCell>
                                </TableHead>
                                <TableBody>
                                    {vote.scores.map((score, s) => (
                                        <TableRow key={s} >
                                            <TableCell component="th" scope="row">
                                                <Typography variant="h6" component="h6">
                                                    {election.races[v].candidates[s].candidate_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell >
                                                {score.score}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    }

                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                ))}
                {ballot?.history &&
                    <>
                        <Typography align='left' variant="h6" component="h6">
                            Ballot History
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table style={{ width: '100%' }} aria-label="simple table">
                                <TableHead>
                                    <TableCell> Action </TableCell>
                                    <TableCell align="right"> Actor </TableCell>
                                    <TableCell align="right"> Timestamp </TableCell>
                                </TableHead>
                                <TableBody>
                                    {ballot.history.map((history, i) => (
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
                    </>
                }
                <Grid item sm={4}>
                    <Button variant='outlined' onClick={() => { onClose() }} > Close </Button>
                </Grid>
            </Grid>
        </Container>
    )
}

export default ViewBallot 