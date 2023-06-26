import { useEffect, useState } from "react"
import React from 'react'
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import PermissionHandler from "../../PermissionHandler";
import { useParams } from "react-router";
import { useGetBallot } from "../../../hooks/useAPI";

const ViewBallot = ({ election, ballot, onClose, fetchBallot, permissions }) => {
    const { ballot_id } = useParams();

    const { data, isPending, error, makeRequest: fetchBallots } = useGetBallot(election.election_id, ballot_id)

    useEffect(() => {
        if (ballot_id) {
            fetchBallots()
        }
    }, [ballot_id])

    let myballot = ballot === null ? data?.ballot : ballot;

    const getDateString = (dateNum) => {
        const event = new Date(dateNum);
        return event.toLocaleString();
    }
    return (
        <Container>

            {isPending && <div> Loading Data... </div>}
            {myballot &&
                <Grid container direction="column" >
                    <Grid item sm={12}>
                        <Typography align='left' variant="h6" component="h6">
                            {`Ballot ID: ${myballot.ballot_id}`}
                        </Typography>
                    </Grid>
                    {myballot.precinct &&
                        <Grid item sm={12}>
                            <Typography align='left' variant="h6" component="h6">
                                {`Precinct: ${myballot.precinct}`}
                            </Typography>
                        </Grid>
                    }
                    <Grid item sm={12}>
                        <Typography align='left' variant="h6" component="h6">
                            {`Date Submitted: ${getDateString(Number(myballot.date_submitted))}`}
                        </Typography>
                    </Grid>
                    <Grid item sm={12}>
                        <Typography align='left' variant="h6" component="h6">
                            {`Status: ${myballot.status}`}
                        </Typography>
                    </Grid>
                    {myballot.votes.map((vote, v) => (
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
                    {myballot?.history &&
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
                                        {myballot.history.map((history, i) => (
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
                        </>
                    }
                    {onClose &&
                        <Grid item sm={4}>
                            <Button variant='outlined' onClick={() => { onClose() }} > Close </Button>
                        </Grid>
                    }
                </Grid>
            }
        </Container>
    )
}

export default ViewBallot 