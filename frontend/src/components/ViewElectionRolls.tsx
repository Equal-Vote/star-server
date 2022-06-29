import { useEffect, useState } from "react"
import StarBallot from "./StarBallot";
import useFetch from "../useFetch";
import { useParams } from "react-router";
import React from 'react'
import { useNavigate } from "react-router";
import { Ballot } from "../../../domain_model/Ballot";
import { Vote } from "../../../domain_model/Vote";
import { Score } from "../../../domain_model/Score";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ProfilePic from '../images/blank-profile.png'
import { Link } from "react-router-dom"
import { createTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import TextField from "@material-ui/core/TextField";
import Box from '@material-ui/core/Box';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@material-ui/core";
import EditElectionRoll from "./EditElectionRoll";

const ViewElectionRolls = () => {
    const { id } = useParams();
    const { data, isPending, error } = useFetch(`/API/Election/${id}/rolls`)
    const [isEditing, setIsEditing] = useState(false)
    const [editedRoll, setEditedRoll] = useState(null)

    const onEdit = (roll) => {
        setIsEditing(true)
        setEditedRoll({ ...roll })

    }
    console.log(data)
    return (
        <Container >
            {error && <div> {error} </div>}
            {isPending && <div> Loading Data... </div>}
            {data && data.electionRoll && !isEditing &&
                <TableContainer component={Paper}>
                    <Table style={{ width: '100%'}} aria-label="simple table">
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
                                    <TableCell align="right" ><Button variant='outlined' onClick={() => onEdit(roll)} > View </Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            }
            {isEditing && editedRoll &&
                <EditElectionRoll roll={editedRoll} />
            }
        </Container>
    )
}

export default ViewElectionRolls
