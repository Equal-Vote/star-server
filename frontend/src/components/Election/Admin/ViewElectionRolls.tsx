import { useEffect, useState } from "react"
import useFetch from "../../../hooks/useFetch";
import { useParams } from "react-router";
import React from 'react'
import Button from "@mui/material/Button";
import Container from '@mui/material/Container';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import EditElectionRoll from "./EditElectionRoll";
import AddElectionRoll from "./AddElectionRoll";
import PermissionHandler from "../../PermissionHandler";
import { Typography } from "@mui/material";
import EnhancedTable, { HeadCell, TableData } from "./../../EnhancedTable";


interface Data extends TableData {
    voter_id: string;
    email: string;
    ip: string;
    precinct: string;
    has_voted: string;
    state: string;
}

const ViewElectionRolls = ({ election, permissions }) => {
    const { id } = useParams();
    const { data, isPending, error, makeRequest: fetchRolls } = useFetch(`/API/Election/${id}/rolls`, 'get')
    const sendInvites = useFetch(`/API/Election/${id}/sendInvites`, 'post')
    useEffect(() => { fetchRolls() }, [])
    const [isEditing, setIsEditing] = useState(false)
    const [addRollPage, setAddRollPage] = useState(false)
    const [editedRoll, setEditedRoll] = useState(null)

    const onOpen = (voter) => {
        setIsEditing(true)
        setEditedRoll(data.electionRoll.find(roll => roll.voter_id === voter.voter_id))
    }
    const onClose = (roll) => {
        setIsEditing(false)
        setAddRollPage(false)
        setEditedRoll(null)
        fetchRolls()
    }

    const onSendInvites = () => {
        sendInvites.makeRequest()
    }

    const headCells: HeadCell[] = [
        {
            id: 'voter_id',
            numeric: false,
            disablePadding: false,
            label: 'Voter ID',
            filterType: 'search'
        },
        {
            id: 'email',
            numeric: false,
            disablePadding: false,
            label: 'Email',
            filterType: 'search'
        },
        {
            id: 'invite_status',
            numeric: false,
            disablePadding: false,
            label: 'Email Invites',
            filterType: 'groups',
            filterGroups: {
                'Not Sent': true,
                'Sent': true,
                'Failed': true,
            }
        },
        {
            id: 'has_voted',
            numeric: false,
            disablePadding: false,
            label: 'Has Voted',
            filterType: 'groups',
            filterGroups: {
                'false': true,
                'true': true,
            }
        },
        {
            id: 'state',
            numeric: false,
            disablePadding: false,
            label: 'State',
            filterType: 'groups',
            filterGroups: {
                approved: true,
                registered: true,
            }
        },
        {
            id: 'ip',
            numeric: false,
            disablePadding: false,
            label: 'IP',
            filterType: 'search'
        },
        {
            id: 'precinct',
            numeric: false,
            disablePadding: false,
            label: 'Precinct',
            filterType: 'search'
        },
    ];

    const tableData = React.useMemo(
        () => {
            if (data && data.electionRoll) {
                const invite_status = 'Not Sent';
                return data.electionRoll.map(roll => {
                    let invite_status = 'Not Sent'
                    if (roll.email_data && roll.email_data.inviteResponse) {
                        if (roll.email_data.inviteResponse.length > 0 && roll.email_data.inviteResponse[0].statusCode < 400) {
                            invite_status = 'Sent'
                        } else {
                            invite_status = 'Failed'
                        }
                    }
                    return {
                        voter_id: roll.voter_id,
                        email: roll.email || '',
                        invite_status: invite_status,
                        ip: roll.ip_address || '',
                        precinct: roll.precinct || '',
                        has_voted: roll.submitted.toString(),
                        state: roll.state.toString()
                    }
                })
            } else {
                return null
            }
        },
        [data],
    );
    return (
        <Container >
            <Typography align='center' gutterBottom variant="h4" component="h4">
                {election.title}
            </Typography>
            <Typography align='center' gutterBottom variant="h5" component="h5">
                Voters
            </Typography>
            {isPending && <div> Loading Data... </div>}
            {data && data.electionRoll && !isEditing && !addRollPage &&
                <>
                    <PermissionHandler permissions={permissions} requiredPermission={'canAddToElectionRoll'}>
                        <Button variant='outlined' onClick={() => setAddRollPage(true)} > Add Voters </Button>
                    </PermissionHandler>
                    <Button variant='outlined' onClick={() => onSendInvites()} > Send Invites </Button>
                    <EnhancedTable
                        headCells={headCells}
                        data={tableData}
                        defaultSortBy="voter_id"
                        tableTitle="Voters"
                        handleOnClick={(voter) => onOpen(voter)}
                    />
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
