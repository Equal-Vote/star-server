import { useEffect, useState } from "react"
import useFetch from "../../../hooks/useFetch";
import { useParams } from "react-router";
import React from 'react'
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Container from '@mui/material/Container';
import { Box, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import EditElectionRoll from "./EditElectionRoll";
import AddElectionRoll from "./AddElectionRoll";
import PermissionHandler from "../../PermissionHandler";
import { Typography } from "@mui/material";
import { StyledButton } from "../../styles";
const hasPermission = (permissions: string[], requiredPermission: string) => {
    return (permissions && permissions.includes(requiredPermission))
}
const AdminHome = ({ election, permissions }) => {
    return (
        <Box
            display='flex'
            justifyContent="center"
            alignItems="center"
            sx={{ width: '100%' }}>
            <Paper elevation={3} sx={{ width: 600, p: 3 }} >
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
                            <Grid xs={12} sx={{ p: 1 }}>
                                {/* <PermissionHandler permissions={permissions} requiredPermission={'canEditElectionRoles'}> */}
                                <Typography variant="h6" component="h6">
                                    Add people to help run your election
                                </Typography>
                                <StyledButton
                                    variant='outlined'
                                    disabled={!hasPermission(permissions, 'canEditElectionRoles')}
                                >
                                    <Typography align='center' variant="h6" component="h6">
                                        Edit Election Roles
                                    </Typography>
                                </StyledButton>
                            </Grid>
                            <Divider style={{ width: '100%' }} />
                            <Grid xs={12} sx={{ p: 1 }}>
                                <Typography variant="h6" component="h6">
                                    Add voters to your election
                                </Typography>
                                <StyledButton
                                    type='button'
                                    variant='contained'
                                    disabled={election.settings.voter_access === 'closed' || !hasPermission(permissions, 'canViewElectionRoll')}
                                    fullwidth
                                >
                                    <Typography align='center' variant="h6" component="h6">
                                        Add voters
                                    </Typography>
                                </StyledButton>
                                {/* <PermissionHandler permissions={permissions} requiredPermission={'canEditElectionRoles'}>
                                </PermissionHandler> */}
                            </Grid>
                            <Divider style={{ width: '100%' }} />
                            <Grid xs={12} sx={{ p: 1 }}>
                                <Typography variant="h6" component="h6">
                                    Edit your election
                                </Typography>
                                <StyledButton
                                    type='button'
                                    variant='contained'
                                    disabled={!hasPermission(permissions, 'canEditElection')}
                                    fullwidth
                                >
                                    <Typography align='center' variant="h6" component="h6">
                                        Edit Election
                                    </Typography>
                                </StyledButton>
                                {/* <PermissionHandler permissions={permissions} requiredPermission={'canEditElectionRoles'}>
                                </PermissionHandler> */}
                            </Grid>
                            <Grid xs={12} sx={{ p: 1 }}>
                                <Typography variant="h6" component="h6">
                                    Preview the ballot
                                </Typography>
                                <StyledButton
                                    type='button'
                                    variant='contained'
                                    fullwidth
                                >
                                    <Typography align='center' variant="h6" component="h6">
                                        Preview ballot
                                    </Typography>
                                </StyledButton>
                                {/* <PermissionHandler permissions={permissions} requiredPermission={'canEditElectionRoles'}>
                                </PermissionHandler> */}
                            </Grid>
                            <Divider style={{ width: '100%' }} />
                            <Grid xs={12} sx={{ p: 1 }}>
                                <Typography variant="h6" component="h6">
                                    {`If you're finished setting up your election you can finalize it. This will prevent future edits ${election.settings.invitation ? ', send out invitations, ' : ''} and open the election for voters to submit ballots${election.start_time ? ' after your specified start time' : ''}.`}
                                </Typography>
                                <StyledButton
                                    type='button'
                                    variant='contained'
                                    fullwidth
                                >
                                    <Typography align='center' variant="h6" component="h6">
                                        Finalize Election
                                    </Typography>
                                </StyledButton>
                                {/* <PermissionHandler permissions={permissions} requiredPermission={'canEditElectionRoles'}>
                                </PermissionHandler> */}
                            </Grid>

                        </>

                    }


                </Grid>
            </Paper>

        </Box>
    )
}

export default AdminHome
