import { useEffect, useState, useContext } from "react"
import { useLocation, useNavigate, useParams } from "react-router";
import React from 'react'
import Button from "@mui/material/Button";
import Container from '@mui/material/Container';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import EditElectionRoll from "./EditElectionRoll";
import AddElectionRoll from "./AddElectionRoll";
import PermissionHandler from "../../PermissionHandler";
import { Typography } from "@mui/material";
import EnhancedTable, { HeadKey }  from "./../../EnhancedTable";
import { useGetRolls, useSendEmails, useSendInvites } from "../../../hooks/useAPI";
import useElection from "../../ElectionContextProvider";
import useFeatureFlags from "../../FeatureFlagContextProvider";
import { ElectionRoll } from "@equal-vote/star-vote-shared/domain_model/ElectionRoll";
import SendEmailDialog from "./SendEmailDialog";
import { PrimaryButton, SecondaryButton } from "~/components/styles";


const ViewElectionRolls = () => {
    const { election, permissions } = useElection()
    const { data, isPending, error, makeRequest: fetchRolls } = useGetRolls(election.election_id)
    const sendEmails = useSendEmails(election.election_id)
    useEffect(() => { fetchRolls() }, [])
    const [isEditing, setIsEditing] = useState(false)
    const [addRollPage, setAddRollPage] = useState(false)
    const [editedRoll, setEditedRoll] = useState<ElectionRoll|null>(null)
    const flags = useFeatureFlags();
    const navigate = useNavigate();
    const location = useLocation();
    const [dialogOpen, setDialogOpen] = useState(false);

    const onOpen = (voter) => {
        setIsEditing(true)
        setEditedRoll(data.electionRoll.find(roll => roll.voter_id === voter.voter_id))
        navigate(`${location.pathname}?editing=true`, { replace: false });
    }
    const onClose = () => {
        setIsEditing(false)
        setAddRollPage(false)
        setEditedRoll(null)
        fetchRolls()
        navigate(location.pathname, { replace: false });
    }
    useEffect(() => {
        if (!location.search.includes('editing=true') && isEditing) {
            onClose();
        }
    }, [location.search])

    const onSendEmails = ({
        subject,
        body,
        target,
    } : {
        subject: string,
        body: string,
        target: 'all' | 'has_voted' | 'has_not_voted' | 'single'
    }) => {
        setDialogOpen(false);
        sendEmails.makeRequest({
            target: target,
            email: { subject, body },
        })
    }

    const onUpdate = async () => {
        const results = await fetchRolls()
        if (!results) return
        setEditedRoll(currentRoll => results.electionRoll.find(roll => roll.voter_id === currentRoll.voter_id))
    }

    let headKeys:HeadKey[] = (election.settings.invitation === 'email')?
        ['email', /*'invite_status', */'has_voted']
    :
        ['email', 'has_voted'];

    if (flags.isSet('PRECINCTS')) headKeys.push('precinct');

    // HACK to detect if they used email
    if(data && data.electionRoll && data.electionRoll.length > 0 && !data.electionRoll[0].email) headKeys.unshift('voter_id')

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
                            <SecondaryButton onClick={() => setAddRollPage(true)} > Add Voters </SecondaryButton>
                        </PermissionHandler>
                    }
                    {election.settings.invitation === 'email' &&
                        <SecondaryButton onClick={() => setDialogOpen(true)} sx={{ml: 2}}>Draft Email Blast </SecondaryButton>
                    }
                    <EnhancedTable
                        headKeys={headKeys}
                        data={electionRollData}
                        isPending={isPending && data?.electionRoll !== undefined}
                        pendingMessage='Loading Voters...'
                        defaultSortBy={headKeys[0]}
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
            <SendEmailDialog electionRoll={data?.electionRoll} open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={onSendEmails}/>
        </Container >
    )
}

export default ViewElectionRolls
