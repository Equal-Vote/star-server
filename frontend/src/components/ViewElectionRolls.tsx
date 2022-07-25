import { useEffect, useState } from "react"
import useFetch from "../useFetch";
import { useParams } from "react-router";
import React from 'react'
import Button from "@material-ui/core/Button";
import Container from '@material-ui/core/Container';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@material-ui/core";
import EditElectionRoll from "./EditElectionRoll";

const ViewElectionRolls = () => {
    const { id } = useParams();
    const { data, isPending, error, makeRequest: fetchRolls } = useFetch(`/API/Election/${id}/rolls`,'get')
    useEffect(() => {fetchRolls()},[])
    const [isEditing, setIsEditing] = useState(false)
    const [editedRoll, setEditedRoll] = useState(null)

    const onOpen = (roll) => {
        setIsEditing(true)
        setEditedRoll({ ...roll })
    }
    const onClose = (roll) => {
        setIsEditing(false)
        setEditedRoll(null)
    }
    console.log(data)
    return (
        <Container >
            {error && <div> {error} </div>}
            {isPending && <div> Loading Data... </div>}
            {data && data.electionRoll && !isEditing &&
                <TableContainer component={Paper}>
                    <Table style={{ width: '100%' }} aria-label="simple table">
                        <TableHead>
                            <TableCell> Voter ID </TableCell>
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
                                    <TableCell align="right" >{roll.submitted.toString()}</TableCell>
                                    <TableCell align="right" >{roll.state.toString()}</TableCell>
                                    <TableCell align="right" ><Button variant='outlined' onClick={() => onOpen(roll)} > View </Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            }
            {isEditing && editedRoll &&
                <EditElectionRoll roll={editedRoll} onClose={onClose} fetchRolls = {fetchRolls} id={id}/>
            }
        </Container>
    )
}

export default ViewElectionRolls
