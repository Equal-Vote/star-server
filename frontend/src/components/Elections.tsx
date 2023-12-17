import React, { useEffect } from 'react'
import { Election } from "@domain_model/Election"
import Typography from '@mui/material/Typography';
import { Box, Container } from "@mui/material"
import Button from "@mui/material/Button";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import EnhancedTable, { HeadCell } from "./EnhancedTable";
import { useNavigate } from "react-router"
import { useGetElections } from "../hooks/useAPI";
import { formatDate } from './util';
import useAuthSession from './AuthSessionContextProvider';

const Elections = () => {
    const authSession = useAuthSession()
    const navigate = useNavigate()
    // const url_params = new URLSearchParams(window.location.search)
    const { data, isPending, error, makeRequest: fetchElections } = useGetElections()

    useEffect(() => {
        fetchElections()
    }, [authSession.isLoggedIn()])

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

    const electionsAsOfficialHeadCells: HeadCell[] = [
        {
            id: 'title',
            numeric: false,
            disablePadding: false,
            label: 'Election Title',
            filterType: 'search'
        },
        {
            id: 'roles',
            numeric: false,
            disablePadding: false,
            label: 'Role',
            filterType: 'search'
        },
        {
            id: 'state',
            numeric: false,
            disablePadding: false,
            label: 'State',
            filterType: 'groups',
            filterGroups: {
                draft: true,
                finalized: true,
                open: true,
                closed: true,
                archived: false
            }
        },
        {
            id: 'start_time',
            numeric: false,
            disablePadding: false,
            label: 'Start Time',
            filterType: 'search',
        },
        {
            id: 'end_time',
            numeric: false,
            disablePadding: false,
            label: 'End Time',
            filterType: 'search',
        },
        {
            id: 'description',
            numeric: false,
            disablePadding: false,
            label: 'Description',
            filterType: 'search'
        },
    ];

    const electionsAsOfficialData = React.useMemo(
        () => {
            if (data && data.elections_as_official) {
                return data.elections_as_official.map(election => ({
                    election_id: election.election_id,
                    title: election.title,
                    roles: getRoles(election),
                    state: election.state || '',
                    start_time: election.start_time ? formatDate(election.start_time) : '',
                    end_time: election.end_time ? formatDate(election.end_time) : '',
                    description: limit(election.description, 30) || '',
                }))
            } else {
                return []
            }
        },
        [data],
    );

    const electionsAsVoterHeadCells: HeadCell[] = [
        {
            id: 'title',
            numeric: false,
            disablePadding: false,
            label: 'Election Title',
            filterType: 'search'
        },
        {
            id: 'state',
            numeric: false,
            disablePadding: false,
            label: 'State',
            filterType: 'groups',
            filterGroups: {
                draft: true,
                finalized: true,
                open: true,
                closed: true,
                archived: false
            }
        },
        {
            id: 'start_time',
            numeric: false,
            disablePadding: false,
            label: 'Start Time',
            filterType: 'search',
        },
        {
            id: 'end_time',
            numeric: false,
            disablePadding: false,
            label: 'End Time',
            filterType: 'search',
        },
        {
            id: 'description',
            numeric: false,
            disablePadding: false,
            label: 'Description',
            filterType: 'search'
        },
    ];

    const electionsAsVoterData = React.useMemo(
        () => {
            if (data && data.elections_as_voter) {
                return data.elections_as_voter.map(election => ({
                    election_id: election.election_id,
                    title: election.title,
                    state: election.state || '',
                    start_time: election.start_time ? formatDate(election.start_time) : '',
                    end_time: election.end_time ? formatDate(election.end_time) : '',
                    description: limit(election.description, 30) || '',
                }))
            } else {
                return []
            }
        },
        [data],
    );

    const openElectionsHeadCells: HeadCell[] = [
        {
            id: 'title',
            numeric: false,
            disablePadding: false,
            label: 'Election Title',
            filterType: 'search'
        },
        {
            id: 'start_time',
            numeric: false,
            disablePadding: false,
            label: 'Start Time',
            filterType: 'search',
        },
        {
            id: 'end_time',
            numeric: false,
            disablePadding: false,
            label: 'End Time',
            filterType: 'search',
        },
        {
            id: 'description',
            numeric: false,
            disablePadding: false,
            label: 'Description',
            filterType: 'search'
        },
    ];

    const openElectionsData = React.useMemo(
        () => {
            if (data && data.open_elections) {
                return data.open_elections.map(election => ({
                    election_id: election.election_id,
                    title: election.title,
                    start_time: election.start_time ? formatDate(election.start_time) : '',
                    end_time: election.end_time ? formatDate(election.end_time) : '',
                    description: limit(election.description, 30) || '',
                }))
            } else {
                return []
            }
        },
        [data],
    );
    
    return (
        <Box
            display='flex'
            justifyContent="center"
            alignItems="center"
            flexDirection={'column'}
            sx={{ pt: 2, width: '100%' }}>
                {isPending && <Typography align='center' variant="h3" component="h2"> Loading Elections... </Typography>}
                {/****** elections you manage ********/}
                <Container>
                    <EnhancedTable
                        headCells={electionsAsOfficialHeadCells}
                        data={electionsAsOfficialData}
                        defaultSortBy="title"
                        tableTitle="Elections You Manage"
                        handleOnClick={(election) => navigate(`/Election/${String(election.election_id)}${authSession.isLoggedIn() ? '/admin' : ''}`)}
                    />
                </Container>

                {/****** elections we're invited to ********/}
                <Container>
                    <EnhancedTable
                        headCells={electionsAsVoterHeadCells}
                        data={electionsAsVoterData}
                        defaultSortBy="title"
                        tableTitle="Elections You Can Vote In"
                        handleOnClick={(election) => navigate(`/Election/${String(election.election_id)}`)}
                    /></Container>

                {/****** elections open to all ********/}
                <Container>
                    <EnhancedTable
                        headCells={openElectionsHeadCells}
                        data={openElectionsData}
                        defaultSortBy="title"
                        tableTitle="Open Elections"
                        handleOnClick={(election) => navigate(`/Election/${String(election.election_id)}`)}
                    /></Container>
        </Box>
    )
}

export default Elections
