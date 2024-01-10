import React, { useEffect } from 'react'
import { Election } from "@domain_model/Election"
import Typography from '@mui/material/Typography';
import { Box, Container } from "@mui/material"
import Button from "@mui/material/Button";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import EnhancedTable, { HeadCell } from "../EnhancedTable";
import { useNavigate } from "react-router"
import { useGetElections } from "../../hooks/useAPI";
import { formatDate } from '../util';
import useAuthSession from '../AuthSessionContextProvider';

export default () => {
    const authSession = useAuthSession()
    const navigate = useNavigate()
    // const url_params = new URLSearchParams(window.location.search)
    const { data, isPending, error, makeRequest: fetchElections } = useGetElections()

    useEffect(() => {
        fetchElections()
    }, [authSession.isLoggedIn()])

    const limit = (string = '', limit = 0) => {
        if (!string) return ''
        return string.substring(0, limit)
    }

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
                {/****** elections open to all ********/}
                <Container>
                    <EnhancedTable
                        headCells={openElectionsHeadCells}
                        data={openElectionsData}
                        defaultSortBy="title"
                        tableTitle="Open Elections"
                        handleOnClick={(election) => navigate(`/Election/${String(election.election_id)}`)}
                    />
                </Container>
        </Box>
    )
}
