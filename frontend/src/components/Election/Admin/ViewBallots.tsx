import { useEffect, useState } from "react"
import useFetch from "../../../hooks/useFetch";
import { useParams } from "react-router";
import React from 'react'
import Button from "@mui/material/Button";
import Container from '@mui/material/Container';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import PermissionHandler from "../../PermissionHandler";
import ViewBallot from "./ViewBallot";

const ViewBallots = ({ election, permissions }) => {
    const { id } = useParams();
    const { data, isPending, error, makeRequest: fetchBallots } = useFetch(`/API/Election/${id}/ballots`, 'get')
    useEffect(() => { fetchBallots() }, [])
    const [isViewing, setIsViewing] = useState(false)
    const [addRollPage, setAddRollPage] = useState(false)
    const [selectedBallot, setSelectedBallot] = useState(null)

    const onOpen = (ballot) => {
        setIsViewing(true)
        setSelectedBallot({ ...ballot })
    }
    const onClose = (roll) => {
        setIsViewing(false)
        setAddRollPage(false)
        setSelectedBallot(null)
        fetchBallots()
    }
    return (
        <Container >
            {error && <div> {error} </div>}
            {isPending && <div> Loading Data... </div>}
            {data && data.ballots && !isViewing && !addRollPage &&
                <TableContainer component={Paper}>
                    <Table style={{ width: '100%' }} aria-label="simple table">
                        <TableHead>
                            <TableCell> ID </TableCell>
                            <TableCell> Precinct </TableCell>
                            <TableCell align="right"> Date Submitted </TableCell>
                            <TableCell align="right"> Status </TableCell>
                            <TableCell align="right"> View </TableCell>
                        </TableHead>
                        <TableBody>
                            {data.ballots.map((ballot) => (
                                <TableRow key={ballot.ballot_id} >
                                    <TableCell component="th" scope="row">{ballot.ballot_id}</TableCell>
                                    <TableCell align="right" >{ballot.precinct || ''}</TableCell>
                                    <TableCell align="right" >{ballot.date_submitted.toString()}</TableCell>
                                    <TableCell align="right" >{ballot.status.toString()}</TableCell>
                                    <TableCell align="right" ><Button variant='outlined' onClick={() => onOpen(ballot)} > View </Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            }
            {isViewing && selectedBallot &&
                <ViewBallot election={election} ballot={selectedBallot} onClose={onClose} fetchBallot={fetchBallots}permissions={permissions} />
            }
        </Container>
    )
}

export default ViewBallots
