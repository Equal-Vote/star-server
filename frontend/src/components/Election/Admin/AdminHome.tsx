import useFetch from "../../../hooks/useFetch";
import React from 'react'
import Grid from "@mui/material/Grid";
import { Box, Divider, Paper } from "@mui/material";
import { Typography } from "@mui/material";
import { StyledButton } from "../../styles";
import { Link } from 'react-router-dom';
const hasPermission = (permissions: string[], requiredPermission: string) => {
    return (permissions && permissions.includes(requiredPermission))
}

import { Election } from '../../../../../domain_model/Election';

type Props = {
    election: Election,
    permissions: string[],
    fetchElection: Function,
}

type SectionProps = {
    Description: any
    Button: any
}

// Section components
const Section = ({ Description, Button }: SectionProps) => {
    return (
        <>
            <Grid xs={8} sx={{ p: 1 }}>
                <Box sx={{minHeight:60}}>
                    {Description}
                </Box>
            </Grid>
            <Grid xs={4} sx={{ p: 1, pl: 2, display: 'flex', alignItems: 'center' }}>
                {Button}
            </Grid>
        </>
    )
}

const EditRolesSection = ({ election, permissions }: { election: Election, permissions: string[] }) => {
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

const AddVotersSection = ({ election, permissions }: { election: Election, permissions: string[] }) => {
    return <Section
        Description={
            (<>
                <Typography variant="h5">
                    Add voters to your election
                </Typography>
                <Typography variant="body1" sx={{ pl: 2 }}>
                    Add voters who are approved to vote in your election
                </Typography>
                <Typography variant="body1" sx={{ pl: 2 }}>
                    Voter access must be set to closed
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
                disabled={election.settings.voter_access !== 'closed' || !hasPermission(permissions, 'canViewElectionRoll')}
                fullwidth
                component={Link} to={`/Election/${election.election_id}/admin/voters`}
            >
                <Typography align='center' variant="body2">
                    Add voters
                </Typography>
            </StyledButton>

        </>)}
    />
}

const ViewVotersSection = ({ election, permissions }: { election: Election, permissions: string[] }) => {
    return <Section
        Description={
            (<>
                <Typography variant="h5">
                    View Voters
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
                    View voters
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

const DuplicateElectionSection = ({ election, permissions }: { election: Election, permissions: string[] }) => {
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
                component={Link} to={`/DuplicateElection/${election.election_id}`}
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

const AdminHome = ({ election, permissions, fetchElection }: Props) => {
    const { makeRequest } = useFetch(`/API/Election/${election.election_id}/setPublicResults`, 'post')
    const togglePublicResults = async () => {
        const public_results = !election.settings.public_results
        await makeRequest({ public_results: public_results })
        await fetchElection()
    }
    const { makeRequest: finalize } = useFetch(`/API/Election/${election.election_id}/finalize`, 'post')
    const finalizeElection = async () => {
        console.log("finalizing election")
        try {
            await finalize()
            await fetchElection()
        } catch (err) {
            console.log(err)
        }
    }
    return (
        <Box
            display='flex'
            justifyContent="center"
            alignItems="center"
            sx={{ width: '100%' }}>
            <Paper elevation={3} sx={{ width: 800, p: 3 }} >
                <Grid container>
                    <Grid xs={12}>
                        <Typography align='center' gutterBottom variant="h4" component="h4">
                            {election.title}
                        </Typography>
                    </Grid>
                    <Grid xs={12}>
                        <Typography align='center' gutterBottom variant="h5" component="h5">
                            Admin Page
                        </Typography>
                    </Grid>
                    {election.state === 'draft' &&
                        <>
                            <Grid xs={12}>
                                <Typography align='center' gutterBottom variant="h6" component="h6">
                                    Your election is still in the draft phase
                                </Typography>
                            </Grid>
                            <Grid xs={12}>
                                <Typography align='center' gutterBottom variant="h6" component="h6">
                                    Before finalizing your election you can...
                                </Typography>
                            </Grid>
                            <PreviewBallotSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />
                            <AddVotersSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />
                            <EditRolesSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />
                            <EditElectionSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />
                            <DuplicateElectionSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />
                            <Grid xs={12} sx={{ p: 1, pt:3, pb: 0}}>
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
                            <Grid xs={12} sx={{ p: 1,pt:0, display: 'flex', alignItems: 'center' }}>
                                <StyledButton
                                    type='button'
                                    variant='contained'
                                    disabled={!hasPermission(permissions, 'canEditElectionState')}
                                    fullwidth
                                    onClick={() => finalizeElection()}
                                >
                                    <Typography align='center' variant="h4" fontWeight={'bold'}>
                                        Finalize Election
                                    </Typography>
                                </StyledButton>
                            </Grid>

                        </>
                    }
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
                                        {`Your election will open on ${new Date(election.start_time).toLocaleString()}`}
                                    </Typography>
                                </Grid>}

                            <PreviewBallotSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />
                            <ViewVotersSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />
                            <EditRolesSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />
                            <DuplicateElectionSection election={election} permissions={permissions} />
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
                                        {`Your election will end on ${new Date(election.end_time).toLocaleString()}`}
                                    </Typography>
                                </Grid>}

                            <EditRolesSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />
                            <ViewVotersSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />

                            <ViewBallotSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />
                            <ResultsSection election={election} permissions={permissions} preliminary={true} />
                            <Divider style={{ width: '100%' }} />
                            <TogglePublicResultsSection election={election} permissions={permissions} togglePublicResults={togglePublicResults}/>
                            <Divider style={{ width: '100%' }} />
                            <DuplicateElectionSection election={election} permissions={permissions} />
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
                                        {`Your election ended on ${new Date(election.end_time).toLocaleString()}`}
                                    </Typography>
                                </Grid>}

                            <EditRolesSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />
                            <ViewVotersSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />
                            <ViewBallotSection election={election} permissions={permissions} />
                            <Divider style={{ width: '100%' }} />

                            <ResultsSection election={election} permissions={permissions} preliminary={false} />
                            <Divider style={{ width: '100%' }} />
                            <TogglePublicResultsSection election={election} permissions={permissions} togglePublicResults={togglePublicResults}/>
                            <Divider style={{ width: '100%' }} />
                            <DuplicateElectionSection election={election} permissions={permissions} />
                        </>
                    }
                </Grid>
            </Paper>

        </Box>
    )
}

export default AdminHome
