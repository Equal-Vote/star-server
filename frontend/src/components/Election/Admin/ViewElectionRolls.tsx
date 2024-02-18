import { useEffect, useState, useContext } from "react"
import { useParams } from "react-router";
import React from 'react'
import Button from "@mui/material/Button";
import Container from '@mui/material/Container';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import EditElectionRoll from "./EditElectionRoll";
import AddElectionRoll from "./AddElectionRoll";
import PermissionHandler from "../../PermissionHandler";
import { Typography } from "@mui/material";
import EnhancedTable  from "./../../EnhancedTable";
import { useGetRolls, useSendInvites } from "../../../hooks/useAPI";
import useElection from "../../ElectionContextProvider";
import { ElectionRoll } from "@domain_model/ElectionRoll";

const ViewElectionRolls = () => {
    const { election, permissions } = useElection()
    const { data, isPending, error, makeRequest: fetchRolls } = useGetRolls(election.election_id)
    const sendInvites = useSendInvites(election.election_id)
    useEffect(() => { fetchRolls() }, [])
    const [isEditing, setIsEditing] = useState(false)
    const [addRollPage, setAddRollPage] = useState(false)
    const [editedRoll, setEditedRoll] = useState<ElectionRoll|null>(null)

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
        // NOTE: since we don't have await here, it 
        sendInvites.makeRequest()
    }

    const onUpdate = async () => {
        const results = await fetchRolls()
        if (!results) return
        setEditedRoll(currentRoll => results.electionRoll.find(roll => roll.voter_id === currentRoll.voter_id))
    }

    let headKeys = (election.settings.invitation === 'email')?
        ['voter_id', 'email', 'invite_status', 'has_voted']
    :
        ['voter_id', 'email', 'has_voted'];

    if (process.env.REACT_APP_FF_PRECINCTS === 'true') {
        headKeys.push('precinct');
    }

    let electionRollData = React.useMemo(
        () => data?.electionRoll ? [...data.electionRoll] : [],
        [data]
    );

    return (
        <Container>
            <Typography align='center' gutterBottom variant="h4" component="h4">
                {election.title}
            </Typography>
            {!isEditing && !addRollPage &&
                <>
                    {election.settings.voter_access === 'closed' &&
                        <PermissionHandler permissions={permissions} requiredPermission={'canAddToElectionRoll'}>
                            <Button variant='outlined' onClick={() => setAddRollPage(true)} > Add Voters </Button>
                        </PermissionHandler>
                    }
                    {election.settings.invitation === 'email' &&
                        < Button variant='outlined' onClick={() => onSendInvites()} > Send Invites </Button>
                    }
                    <EnhancedTable
                        headKeys={headKeys}
                        data={electionRollData}
                        isPending={isPending && data?.electionRoll !== undefined}
                        pendingMessage='Loading Voters...'
                        defaultSortBy="voter_id"
                        title="Voters"
                        handleOnClick={(voter) => onOpen(voter)}
                        emptyContent={<p>This election doesn't have any voters yet</p>}
                    />
                </>
            }
            {
                isEditing && editedRoll &&
                <EditElectionRoll roll={editedRoll} onClose={onClose} fetchRolls={onUpdate}/>
            }
            {
                addRollPage &&
                <AddElectionRoll onClose={onClose} />
            }
        </Container >
    )
}

export default ViewElectionRolls
