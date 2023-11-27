import React, { useContext } from 'react'
import Grid from "@mui/material/Grid";
import { Box, Divider, Paper } from "@mui/material";
import { Typography } from "@mui/material";
import { StyledButton } from "../../styles";
import { Link, useNavigate } from 'react-router-dom';
import { Election } from '../../../../../domain_model/Election';
import ShareButton from "../ShareButton";
import { useArchiveEleciton, useFinalizeEleciton, usePostElection, useSetPublicResults } from "../../../hooks/useAPI";
import { formatDate } from '../../util';
import useConfirm from '../../ConfirmationDialogProvider';
import useElection from '../../ElectionContextProvider';
import ElectionDetailsInlineForm from '../../ElectionForm/Details/ElectionDetailsInlineForm';
import Races from '../../ElectionForm/Races/Races';
import ElectionSettings from '../../ElectionForm/ElectionSettings';
import structuredClone from '@ungap/structured-clone';
import useAuthSession from '../../AuthSessionContextProvider';
const hasPermission = (permissions: string[], requiredPermission: string) => {
    return (permissions && permissions.includes(requiredPermission))
}

type SectionProps = {
    Description: any
    Button: any
}

// Section components
const Section = ({ Description, Button }: SectionProps) => {
    return (
        <>
            <Grid xs={12} md={8} sx={{ p: 1 }}>
                <Box sx={{ minHeight: { xs: 0, md: 60 } }}>
                    {Description}
                </Box>
            </Grid>
            <Grid xs={12} md={4} sx={{ p: 1, pl: 2, display: 'flex', alignItems: 'center' }}>
                {Button}
            </Grid>
        </>
    )
}

const EditRolesSection = ({ election, permissions }: { election: Election, permissions: string[] }) => {
    if (process.env.REACT_APP_FF_METHOD_PLURALITY !== 'true') return <></>;
    return <Section
        Description={
            (<>
                <Typography variant="h5">
                    Add people to help run your election
                </Typography>
                <Typography variant="body1" sx={{ pl: 2 }}>
                    Add election administrators, auditors, credentialers
                </Typography>
                {!hasPermission(permissions, 'canEditElectionRoles') &&
                    <Typography variant="body1" sx={{ color: 'error.main', pl: 2 }}>
                        You do not have the correct permissions for this action
                    </Typography>
                }
            </>)}
        Button={(<>
            <StyledButton
                variant='contained'
                disabled={!hasPermission(permissions, 'canEditElectionRoles')}
                fullwidth
                component={Link} to={`/Election/${election.election_id}/admin/roles`}
            >
                <Typography align='center' variant="body2">
                    Edit Election Roles
                </Typography>
            </StyledButton>

        </>)}
    />
}

const ViewBallotSection = ({ election, permissions }: { election: Election, permissions: string[] }) => {
    return <Section
        Description={
            (<>
                <Typography variant="h5">
                    View ballots
                </Typography>
                {!hasPermission(permissions, 'canViewBallots') &&
                    <Typography variant="body1" sx={{ color: 'error.main', pl: 2 }}>
                        You do not have the correct permissions for this action
                    </Typography>
                }
            </>)}
        Button={(<>
            <StyledButton
                type='button'
                variant='contained'
                disabled={!hasPermission(permissions, 'canViewBallots')}
                fullwidth
                component={Link} to={`/Election/${election.election_id}/admin/ballots`}
            >
                View ballots
            </StyledButton>

        </>)}
    />
}

const EditElectionSection = ({ election, permissions }: { election: Election, permissions: string[] }) => {
    return <Section
        Description={
            (<>
                <Typography variant="h5">
                    Edit your election
                </Typography>
                {!hasPermission(permissions, 'canEditElection') &&
                    <Typography variant="body1" sx={{ color: 'error.main', pl: 2 }}>
                        You do not have the correct permissions for this action
                    </Typography>
                }
            </>)}
        Button={(<>
            <StyledButton
                type='button'
                variant='contained'
                disabled={!hasPermission(permissions, 'canEditElection')}
                fullwidth
                component={Link} to={`/Election/${election.election_id}/edit`}
            >
                <Typography align='center' variant="body2">
                    Edit Election
                </Typography>
            </StyledButton>

        </>)}
    />
}

const VotersSection = ({ election, permissions }: { election: Election, permissions: string[] }) => {
    return <Section
        Description={
            (<>
                <Typography variant="h5">
                    {election.state === 'draft' ? 'Add voters to your election' : 'View voters'}
                </Typography>
                <Typography variant="body1" sx={{ pl: 2 }}>
                    {election.state === 'draft' ? 'Add voters who are approved to vote in your election' : 'View the status of your voters'}
                </Typography>
                {!hasPermission(permissions, 'canViewElectionRoll') &&
                    <Typography variant="body1" sx={{ color: 'error.main', pl: 2 }}>
                        You do not have the correct permissions for this action
                    </Typography>
                }
            </>)}
        Button={(<>
            <StyledButton
                type='button'
                variant='contained'
                disabled={!hasPermission(permissions, 'canViewElectionRoll')}
                fullwidth
                component={Link} to={`/Election/${election.election_id}/admin/voters`}
            >
                <Typography align='center' variant="body2">
                    {election.state === 'draft' ? 'Add voters' : 'View voters'}
                </Typography>
            </StyledButton>

        </>)}
    />
}

const PreviewBallotSection = ({ election, permissions }: { election: Election, permissions: string[] }) => {
    return <Section
        Description={
            (<>
                <Typography variant="h5">
                    Preview the ballot
                </Typography>
                {!hasPermission(permissions, 'canViewElectionRoll') &&
                    <Typography variant="body1" sx={{ color: 'error.main', pl: 2 }}>
                        You do not have the correct permissions for this action
                    </Typography>
                }
            </>)}
        Button={(<>
            <StyledButton
                type='button'
                variant='contained'
                fullwidth
                component={Link} to={`/Election/${election.election_id}/vote`}
            >
                <Typography align='center' variant="body2">
                    Preview ballot
                </Typography>
            </StyledButton>

        </>)}
    />
}

const DuplicateElectionSection = ({ election, permissions, duplicateElection }: { election: Election, permissions: string[], duplicateElection: Function }) => {
    return <Section
        Description={
            (<>
                <Typography variant="h5">
                    Duplicate
                </Typography>
                <Typography variant="body1" sx={{ pl: 2 }}>
                    Create copy of this election
                </Typography>
            </>)}
        Button={(<>
            <StyledButton
                type='button'
                variant='contained'
                disabled={!hasPermission(permissions, 'canEditElectionState')}
                fullwidth
                onClick={() => duplicateElection()}
            >
                <Typography align='center' variant="body2">
                    Duplicate
                </Typography>
            </StyledButton>
        </>)}
    />
}


const ResultsSection = ({ election, permissions, preliminary }: { election: Election, permissions: string[], preliminary: boolean }) => {
    return <Section
        Description={
            (<>
                <Typography variant="h5">
                    {preliminary ? 'View preliminary results' : 'View results'}
                </Typography>
                {!(hasPermission(permissions, 'canViewPreliminaryResults') || election.settings.public_results === true) &&
                    <Typography variant="body1" sx={{ color: 'error.main', pl: 2 }}>
                        You do not have the correct permissions for this action
                    </Typography>
                }
            </>)}
        Button={(<>
            <StyledButton
                type='button'
                variant='contained'
                disabled={!(hasPermission(permissions, 'canViewPreliminaryResults') || election.settings.public_results === true)}
                fullwidth
                component={Link} to={`/Election/${election.election_id}/results`}
            >
                View results
            </StyledButton>

        </>)}
    />
}

const TogglePublicResultsSection = ({ election, permissions, togglePublicResults }: { election: Election, permissions: string[], togglePublicResults: Function }) => {
    return <Section
        Description={
            (<>
                <Typography variant="h5">
                    {election.settings.public_results === true ? 'Make results private' : 'Make results public'}
                </Typography>
                {!hasPermission(permissions, 'canEditElectionState') &&
                    <Typography variant="body1" sx={{ color: 'error.main', pl: 2 }}>
                        You do not have the correct permissions for this action
                    </Typography>
                }
            </>)}
        Button={(<>
            <StyledButton
                type='button'
                variant='contained'
                disabled={!hasPermission(permissions, 'canEditElectionState')}
                fullwidth
                onClick={() => togglePublicResults()}
            >
                {election.settings.public_results === true ? 'Make results private' : 'Make results public'}
            </StyledButton>

        </>)}
    />
}

const ArchiveElectionSection = ({ election, permissions, archiveElection }: { election: Election, permissions: string[], archiveElection: Function }) => {
    return <Section
        Description={
            (<>
                <Typography variant="h5">
                    Archive
                </Typography>
                <Typography variant="body1" sx={{ pl: 2 }}>
                    Achives election, preventing future changes and hiding it from on the elections page
                </Typography>
                {!hasPermission(permissions, 'canEditElectionState') &&
                    <Typography variant="body1" sx={{ color: 'error.main', pl: 2 }}>
                        You do not have the correct permissions for this action
                    </Typography>
                }
            </>)}
        Button={(<>
            <StyledButton
                type='button'
                variant='contained'
                disabled={!hasPermission(permissions, 'canEditElectionState')}
                fullwidth
                onClick={() => archiveElection()}
            >
                Archive
            </StyledButton>

        </>)}
    />
}


const ShareSection = ({ election, permissions }: { election: Election, permissions: string[] }) => {
    return <Section
        Description={
            (<>
                <Typography variant="h5">
                    Share your election
                </Typography>
            </>)}
        Button={(<>
            <ShareButton url={`${window.location.origin}/Election/${election.election_id}`} />

        </>)}
    />
}

const HeaderSection = ({ election, permissions }: { election: Election, permissions: string[] }) => {
    return (
        <>
            {election.state === 'finalized' &&
                <>
                    <Grid xs={12}>
                        <Typography align='center' gutterBottom variant="h6" component="h6">
                            Your election is finalized
                        </Typography>
                    </Grid>
                    {election.settings.invitation &&
                        <Grid xs={12}>
                            <Typography align='center' gutterBottom variant="h6" component="h6">
                                Invitations have been sent to your voters
                            </Typography>
                        </Grid>
                    }
                    {election.start_time &&
                        <Grid xs={12}>
                            <Typography align='center' gutterBottom variant="h6" component="h6">
                                {`Your election will open on ${formatDate(election.start_time, election.settings.time_zone)}`}
                            </Typography>
                        </Grid>}
                </>
            }
            {election.state === 'open' &&
                <>
                    <Grid xs={12}>
                        <Typography align='center' gutterBottom variant="h6" component="h6">
                            Your election is open
                        </Typography>
                    </Grid>
                    {election.settings.invitation &&
                        <Grid xs={12}>
                            <Typography align='center' gutterBottom variant="h6" component="h6">
                                Invitations have been sent to your voters
                            </Typography>
                        </Grid>
                    }
                    {election.end_time &&
                        <Grid xs={12}>
                            <Typography align='center' gutterBottom variant="h6" component="h6">
                                {`Your election will end on ${formatDate(election.end_time, election.settings.time_zone)}`}
                            </Typography>
                        </Grid>}
                </>
            }
            {election.state === 'closed' &&
                <>
                    <Grid xs={12}>
                        <Typography align='center' gutterBottom variant="h6" component="h6">
                            Your election is closed
                        </Typography>
                    </Grid>
                    {election.end_time &&
                        <Grid xs={12}>
                            <Typography align='center' gutterBottom variant="h6" component="h6">
                                {`Your election ended on ${formatDate(election.end_time, election.settings.time_zone)}`}
                            </Typography>
                        </Grid>}
                </>
            }
            {election.state === 'archived' &&
                <>
                    <Grid xs={12}>
                        <Typography align='center' gutterBottom variant="h6" component="h6">
                            This election has been archived
                        </Typography>
                    </Grid>
                    {election.end_time &&
                        <Grid xs={12}>
                            <Typography align='center' gutterBottom variant="h6" component="h6">
                                {`Your election ended on ${formatDate(election.end_time, election.settings.time_zone)}`}
                            </Typography>
                        </Grid>}
                </>
            }


        </>)
}

const FinalizeSection = ({ election, permissions, finalizeElection }: { election: Election, permissions: string[], finalizeElection: Function }) => {
    return (
        <>
            <Grid xs={12} sx={{ p: 1, pt: 3, pb: 0 }}>
                <Typography align='center' variant="body1" sx={{ pl: 2 }}>
                    {/* {`If you're finished setting up your election you can finalize it. This will prevent future edits ${election.settings.invitation ? ', send out invitations, ' : ''} and open the election for voters to submit ballots${election.start_time ? ' after your specified start time' : ''}.`} */}
                    {`When finished setting up your election, finalize it. Once final, it can't be edited. Voting begins ${election.start_time ? 'after your specified start time.' : 'immediately.'}`}
                </Typography>
                {election.settings.invitation &&
                    <Typography align='center' variant="body1" sx={{ pl: 2 }}>
                        Invitations will be sent to your voters
                    </Typography>
                }
                {!hasPermission(permissions, 'canEditElectionState') &&
                    <Typography align='center' variant="body1" sx={{ color: 'error.main', pl: 2 }}>
                        You do not have the correct permissions for this action
                    </Typography>
                }
            </Grid>
            <Grid xs={12} sx={{ p: 1, pt: 0, display: 'flex', alignItems: 'center' }}>
                <StyledButton
                    type='button'
                    variant='contained'
                    disabled={election.title.length === 0 || election.races.length === 0 || !hasPermission(permissions, 'canEditElectionState')}
                    fullwidth
                    onClick={() => finalizeElection()}
                >
                    <Typography align='center' variant="h4" fontWeight={'bold'}>
                        Finalize Election
                    </Typography>
                </StyledButton>
            </Grid>
        </>)
}
    
const AdminHome = () => {
    
  const authSession = useAuthSession()
    const { election, refreshElection: fetchElection, permissions } = useElection()
    const { makeRequest } = useSetPublicResults(election.election_id)
    const togglePublicResults = async () => {
        const public_results = !election.settings.public_results
        await makeRequest({ public_results: public_results })
        await fetchElection()
    }
    const { makeRequest: finalize } = useFinalizeEleciton(election.election_id)
    const { makeRequest: archive } = useArchiveEleciton(election.election_id)

    const navigate = useNavigate()
    const { error, isPending, makeRequest: postElection } = usePostElection()
    
    const confirm = useConfirm()

    const finalizeElection = async () => {
        console.log("finalizing election")
        const confirmed = await confirm(
            {
                title: 'Confirm Finalize Election',
                message: "Are you sure you want to finalize your election? Once finalized you won't be able to edit it."
            })
        if (!confirmed) return
        try {
            await finalize()
            await fetchElection()
        } catch (err) {
            console.log(err)
        }
    }

    const archiveElection = async () => {
        console.log("archiving election")
        const confirmed = await confirm(
            {
                title: 'Confirm Archive Election',
                message: "Are you sure you wish to archive this election? This action cannot be undone."
            })
        if (!confirmed) return
        console.log('confirmed')
        try {
            await archive()
            await fetchElection()
        } catch (err) {
            console.log(err)
        }
    }
    const duplicateElection = async () => {
        console.log("duplicating election")
        const confirmed = await confirm(
            {
                title: 'Confirm Duplicate Election',
                message: "Are you sure you wish to duplicate this election?"
            })
        if (!confirmed) return
        console.log('confirmed')
        const copiedElection = structuredClone(election)
        copiedElection.title = 'Copy of ' + copiedElection.title
        copiedElection.frontend_url = ''
        copiedElection.owner_id = authSession.getIdField('sub')
        copiedElection.state = 'draft'

        const newElection = await postElection(
            {
                Election: copiedElection,
            })

        if ((!newElection)) {
            throw Error("Error submitting election");
        }
        navigate(`/Election/${newElection.election.election_id}/admin`)
    }
    

    return (
        <Box
            display='flex'
            justifyContent="center"
            alignItems="center"
            sx={{ width: '100%' }}>
            <Grid container sx={{ width: 800 }}>
                <Grid xs={12} sx={{ p: 1 }}>
                    <HeaderSection election={election} permissions={permissions} />
                </Grid>
                <Grid xs={12} sx={{ p: 1 }}>
                    <ElectionDetailsInlineForm />
                </Grid>
                <Grid xs={12} sx={{ p: 1 }}>
                    <Races />
                </Grid>
                <Grid xs={12} sx={{ p: 1 }}>
                    <ElectionSettings />
                </Grid>
                <PreviewBallotSection election={election} permissions={permissions} />
                {(election.settings.voter_access === 'closed' || election.state !== 'draft') && <>
                    <Divider style={{ width: '100%' }} />
                    <VotersSection election={election} permissions={permissions} />
                </>}
                {(election.state !== 'draft' && election.state !== 'finalized') && <>
                    <Divider style={{ width: '100%' }} />
                    <ShareSection election={election} permissions={permissions} />
                    <Divider style={{ width: '100%' }} />
                    <ResultsSection election={election} permissions={permissions} preliminary={false} />
                    <Divider style={{ width: '100%' }} />
                    <TogglePublicResultsSection election={election} permissions={permissions} togglePublicResults={togglePublicResults} />
                    <Divider style={{ width: '100%' }} />
                    <ViewBallotSection election={election} permissions={permissions} />
                </>}
                <Divider style={{ width: '100%' }} />
                <EditRolesSection election={election} permissions={permissions} />
                <Divider style={{ width: '100%' }} />
                <DuplicateElectionSection election={election} permissions={permissions} duplicateElection={duplicateElection}/>
                <Divider style={{ width: '100%' }} />
                <ArchiveElectionSection election={election} permissions={permissions} archiveElection={archiveElection} />
                {election.state === 'draft' &&
                    <Grid xs={12} sx={{ p: 1 }}>
                        <Divider style={{ width: '100%' }} />
                        <FinalizeSection election={election} permissions={permissions} finalizeElection={finalizeElection} />
                    </Grid>
                }

            </Grid>
        </Box>
    )
}

export default AdminHome
