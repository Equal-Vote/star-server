import ElectionCard from "./ElectionCard"
import useFetch from "../hooks/useFetch"
import { Link } from "react-router-dom"
import React, { useEffect } from 'react'
import { Election } from "../../../domain_model/Election"
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { Box } from "@mui/material"
import Button from "@mui/material/Button";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";

const Elections = ({ authSession }) => {
    // const url_params = new URLSearchParams(window.location.search)
    var url = '/API/Elections';
    // if (url_params.has('filter')) {
    //     url = `${url}?filter=${url_params.get('filter')}`
    // }
    console.log(`fetch ${url}`)
    const { data, isPending, error, makeRequest: fetchElections } = useFetch(url, 'get')

    useEffect(() => {
        fetchElections()
    }, [url])
    const userEmail = authSession.getIdField('email')
    const id = authSession.getIdField('sub')
    const getRoles = (election: Election) => {
        let roles = []
        if (election.owner_id === id) {
            roles.push('Owner')
        }
        if (election.admin_ids?.includes(userEmail)) {
            roles.push('Admin')
        }
        if (election.audit_ids?.includes(userEmail)) {
            roles.push('Auditor')
        }
        if (election.credential_ids?.includes(userEmail)) {
            roles.push('Credentialer')
        }
        return roles.join(', ')
    }
    const limit = (string = '', limit = 0) => {
        if (!string) return ''
        return string.substring(0, limit)
    }
    return (
        <Box
            display='flex'
            justifyContent="center"
            alignItems="center"
            sx={{ width: '100%', pt:2 }}>
            <Paper elevation={3} sx={{ width: 800, p: 3 }} >
                {isPending && <Typography align='center' variant="h3" component="h2"> Loading Elections... </Typography>}
                <Typography variant="h5" component="h5">
                    Elections you manage
                </Typography>
                <TableContainer component={Paper}>
                    <Table style={{ width: '100%' }} aria-label="simple table">
                        <TableHead>
                            <TableCell> Election Title </TableCell>
                            <TableCell> Role </TableCell>
                            <TableCell> State </TableCell>
                            <TableCell> Start Date </TableCell>
                            <TableCell> End Date </TableCell>
                            <TableCell> Description </TableCell>
                            <TableCell> View </TableCell>
                        </TableHead>
                        <TableBody>
                            {data?.elections_as_official?.map((election: Election) => (
                                <TableRow key={election.election_id} >
                                    <TableCell component="th" scope="row">
                                        {election.title}
                                    </TableCell>
                                    <TableCell >{getRoles(election)}</TableCell>
                                    <TableCell >{election.state || ''}</TableCell>
                                    <TableCell > {election.start_time ? new Date(election.start_time).toLocaleString() : ''}</TableCell>
                                    <TableCell >{election.end_time ? new Date(election.end_time).toLocaleString() : ''}</TableCell>
                                    <TableCell >{limit(election.description, 30) || ''}</TableCell>
                                    <TableCell ><Button variant='outlined' href={`/Election/${String(election.election_id)}/admin`} > View </Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Typography variant="h5" component="h5"sx={{pt:2 }}>
                    Elections as a voter
                </Typography>
                <TableContainer component={Paper}>
                    <Table style={{ width: '100%' }} aria-label="simple table">
                        <TableHead>
                            <TableCell> Election Title </TableCell>
                            <TableCell> State </TableCell>
                            <TableCell> Start Date </TableCell>
                            <TableCell> End Date </TableCell>
                            <TableCell> Description </TableCell>
                            <TableCell> View </TableCell>
                        </TableHead>
                        <TableBody>
                            {data?.elections_as_voter?.map((election: Election) => (
                                <TableRow key={election.election_id} >
                                    <TableCell component="th" scope="row">
                                        {election.title}
                                    </TableCell>
                                    <TableCell >{election.state || ''}</TableCell>
                                    <TableCell > {election.start_time ? new Date(election.start_time).toLocaleString() : ''}</TableCell>
                                    <TableCell >{election.end_time ? new Date(election.end_time).toLocaleString() : ''}</TableCell>
                                    <TableCell >{limit(election.description, 30) || ''}</TableCell>
                                    <TableCell ><Button variant='outlined' href={`/Election/${String(election.election_id)}`} > View </Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    )
}

export default Elections
