import { useEffect, useState } from "react"
import React from 'react'
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Box, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import PermissionHandler from "../../PermissionHandler";
import { useParams } from "react-router";
import { useGetBallot } from "../../../hooks/useAPI";
import { epochToDateString, getLocalTimeZoneShort, useSubstitutedTranslation } from "../../util";
import useElection from "../../ElectionContextProvider";
import { PrimaryButton, SecondaryButton } from "~/components/styles";
import ShareButton from "../ShareButton";

const ViewBallot = ({ ballot, onClose }) => {
    // ViewBallot doesn't iterate over races but it does referene them by index so we use the filtered version
    const { election } = useElection()
    const { ballot_id } = useParams();
    const { t } = useSubstitutedTranslation(election.settings.term_type);

    const { data, isPending, error, makeRequest: fetchBallots } = useGetBallot(election.election_id, ballot_id)

    useEffect(() => {
        if (ballot_id) {
            fetchBallots()
        }
    }, [ballot_id])

    let myballot = ballot === null ? data?.ballot : ballot;

    return (
        <Container>
            {isPending && <div> Loading Data... </div>}
            {myballot &&
                <>
                <Box display='flex' flexDirection='column' alignItems='center' sx={{maxWidth: '800px', margin: 'auto'}}>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' } }} >
                        {['draft', 'open', 'closed'].includes(election.state) && election.settings.public_results === true &&
                            <Box sx={{ width: '100%',  p: 1, px:{xs: 5, sm: 1} }}>
                                <SecondaryButton
                                    type='button'
                                    fullWidth
                                    href={`/${election.election_id}/results`} >
                                    {t('ballot_submitted.results')}
                                </SecondaryButton>
                            </Box>
                        }
                        {election.settings.voter_access !== 'closed' &&
                            <Box sx={{ width: '100%', p: 1, px:{xs: 5, sm: 1}  }}>
                                <ShareButton url={`${window.location.origin}/${election.election_id}`}/>
                            </Box>
                        }
                    </Box>

                    <a href='https://www.equal.vote/donate'>{t('ballot_submitted.donate')}</a>
                </Box>

                <Divider sx={{my: 4}}/>

                <Grid container direction="column" >
                    <Grid item sm={12}>
                        <Typography align='left' variant="h6" component="h6">
                            {`Ballot ID: ${myballot.ballot_id}`}
                        </Typography>
                    </Grid>
                    {myballot.precinct &&
                        <Grid item sm={12}>
                            <Typography align='left' variant="h6" component="h6">
                                {`Precinct: ${myballot.precinct}`}
                            </Typography>
                        </Grid>
                    }
                    <Grid item sm={12}>
                        <Typography align='left' variant="h6" component="h6">
                            {`Status: ${myballot.status}`}
                        </Typography>
                    </Grid>
                    {myballot.votes.map((vote, v) => (
                        <>

                            <Typography align='left' variant="h6" component="h6">
                                {election.races[v].title}
                            </Typography>


                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableCell> Candidate </TableCell>
                                        <TableCell> Score </TableCell>
                                    </TableHead>
                                    <TableBody>
                                        {vote.scores.map((score, s) => (
                                            <TableRow key={s} >
                                                <TableCell component="th" scope="row">
                                                    <Typography variant="h6" component="h6">
                                                        {election.races.find(r => r.race_id == vote.race_id).candidates[s].candidate_name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell >
                                                    {score.score}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                        }

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    ))}
                    {onClose &&
                        <Grid item sm={4}>
                            <SecondaryButton onClick={() => { onClose() }} > Close </SecondaryButton>
                        </Grid>
                    }
                </Grid>
            </>}
        </Container>
    )
}

export default ViewBallot 