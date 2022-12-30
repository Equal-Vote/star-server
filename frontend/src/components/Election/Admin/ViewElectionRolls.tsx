import { useEffect, useState } from "react"
import useFetch from "../../../hooks/useFetch";
import { useParams } from "react-router";
import React from 'react'
import Button from "@mui/material/Button";
import Container from '@mui/material/Container';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@material-ui/core";
import EditElectionRoll from "./EditElectionRoll";
import AddElectionRoll from "./AddElectionRoll";
import PermissionHandler from "../../PermissionHandler";
import { Typography } from "@mui/material";

const ViewElectionRolls = ({ election, permissions }) => {
    const { id } = useParams();
    const { data, isPending, error, makeRequest: fetchRolls } = useFetch(`/API/Election/${id}/rolls`, 'get')
    useEffect(() => { fetchRolls() }, [])
    const [isEditing, setIsEditing] = useState(false)
    const [addRollPage, setAddRollPage] = useState(false)
    const [editedRoll, setEditedRoll] = useState(null)

    const onOpen = (roll) => {
        setIsEditing(true)
        setEditedRoll({ ...roll })
    }
    const onClose = (roll) => {
        setIsEditing(false)
        setAddRollPage(false)
        setEditedRoll(null)
        fetchRolls()
    }
    console.log(data)
    return (
        <Container >
            <Typography align='center' gutterBottom variant="h4" component="h4">
                {election.title}
            </Typography>
            <Typography align='center' gutterBottom variant="h5" component="h5">
                Election Rolls
            </Typography>
            {error && <div> {error} </div>}
            {isPending && <div> Loading Data... </div>}
            {data && data.electionRoll && !isEditing && !addRollPage &&
                <>
                    <PermissionHandler permissions={permissions} requiredPermission={'canAddToElectionRoll'}>
                        <Button variant='outlined' onClick={() => setAddRollPage(true)} > Add Rolls </Button>
                    </PermissionHandler>
                    <TableContainer component={Paper}>
                        <Table style={{ width: '100%' }} aria-label="simple table">
                            <TableHead>
                                <TableCell> Voter ID </TableCell>
                                <TableCell> Email </TableCell>
                                <TableCell> IP Address </TableCell>
                                <TableCell> Precinct </TableCell>
                                <TableCell align="right"> Has Voted </TableCell>
                                <TableCell align="right"> State </TableCell>
                                <TableCell align="right"> View </TableCell>
                            </TableHead>
                            <TableBody>
                                {data.electionRoll.map((roll) => (
                                    <TableRow key={roll.voter_id} >
                                        <TableCell component="th" scope="row">
                                            {roll.voter_id}
                                        </TableCell>
                                        <TableCell align="right" >{roll.email || ''}</TableCell>
                                        <TableCell align="right" >{roll.ip_address || ''}</TableCell>
                                        <TableCell align="right" >{roll.precinct || ''}</TableCell>
                                        <TableCell align="right" >{roll.submitted.toString()}</TableCell>
                                        <TableCell align="right" >{roll.state.toString()}</TableCell>
                                        <TableCell align="right" ><Button variant='outlined' onClick={() => onOpen(roll)} > View </Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            }
            {isEditing && editedRoll &&
                <EditElectionRoll roll={editedRoll} onClose={onClose} fetchRolls={fetchRolls} id={id} permissions={permissions} />
            }
            {addRollPage &&
                <AddElectionRoll election={election} onClose={onClose} />
            }
        </Container>
    )
}

export default ViewElectionRolls
