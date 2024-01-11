import React, {useMemo} from 'react'
import { Box, Container, Typography } from "@mui/material"
import EnhancedTable, { HeadCell } from "../EnhancedTable"
import { formatDate } from '../util';
import { useNavigate } from "react-router"

interface HeadCellPool {
    [key: string]: HeadCell
}

const limit = (string = '', limit = 0) => {
    if (!string) return ''
    return string.substring(0, limit)
}

const headCellPool: HeadCellPool = {
    title: {
        id: 'title',
        numeric: false,
        disablePadding: false,
        label: 'Election Title',
        filterType: 'search',
        formatter: a => a
    },
    roles: {
        id: 'roles',
        numeric: false,
        disablePadding: false,
        label: 'Role',
        filterType: 'search',
        formatter: a => a
    },
    state: {
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
        },
        formatter: state => state || ''
    },
    start_time: {
        id: 'start_time',
        numeric: false,
        disablePadding: false,
        label: 'Start Time',
        filterType: 'search',
        formatter: formatDate
    },
    end_time: {
        id: 'end_time',
        numeric: false,
        disablePadding: false,
        label: 'End Time',
        filterType: 'search',
        formatter: formatDate
    },
    description: {
        id: 'description',
        numeric: false,
        disablePadding: false,
        label: 'Description',
        filterType: 'search',
        formatter: descr => limit(descr, 30)
    },
}

const formatTableData = (data) => {
    let fData = data.map(election => {
        let fElection = {};
        Object.keys(election).forEach( key => {
            fElection[key] = key in headCellPool ? headCellPool[key].formatter(election[key]) : election[key];
        });
        return fElection;
    });
    return fData;
}

export default ({title, headKeys, isPending, electionData}) => {
    const navigate = useNavigate();
    let headCells = headKeys.map(key => headCellPool[key]);
    let formattedData = useMemo(() => formatTableData(electionData), [electionData]);

    return <Box
        display='flex'
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        sx={{ pt: 2, width: '100%' }}>
            {isPending && <Typography align='center' variant="h3" component="h2"> Loading Elections... </Typography>}
            <Container>
                <EnhancedTable
                    headCells={headCells}
                    data={formattedData}
                    defaultSortBy="title"
                    tableTitle={title}
                    handleOnClick={(election) => navigate(`/Election/${String(election.election_id)}`)}
                />
            </Container>
    </Box>
}