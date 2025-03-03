import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router";
import React from 'react'
import Button from "@mui/material/Button";
import Container from '@mui/material/Container';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import PermissionHandler from "../../PermissionHandler";
import ViewBallot from "./ViewBallot";
import { useGetBallots } from "../../../hooks/useAPI";
import { epochToDateString, getLocalTimeZoneShort, useSubstitutedTranslation } from "../../util";
import useElection from "../../ElectionContextProvider";
import useFeatureFlags from "../../FeatureFlagContextProvider";
import DraftWarning from "../DraftWarning";
import { BallotDataExport } from "../Results/BallotDataExport";
import { SecondaryButton } from "~/components/styles";

const ViewBallots = () => {
    // some ballots will have different subsets of the races, but we need the full list anyway
    // so we use election instead of precinctFilteredElection
    const { election } = useElection()
    const { data, isPending, error, makeRequest: fetchBallots } = useGetBallots(election.election_id)

    const flags = useFeatureFlags();
    useEffect(() => { fetchBallots() }, [])
    const [isViewing, setIsViewing] = useState(false)
    const [addRollPage, setAddRollPage] = useState(false)
    const [selectedBallot, setSelectedBallot] = useState(null)
    const navigate = useNavigate();
    const location = useLocation();

    const {t} = useSubstitutedTranslation(election.settings.term_type)

    const onOpen = (ballot) => {
        setIsViewing(true);
        setSelectedBallot({ ...ballot })
        navigate(`${location.pathname}?viewing=true`, { replace: false });
    }
    const onClose = () => {
        setIsViewing(false)
        setAddRollPage(false)
        setSelectedBallot(null)
        fetchBallots()
        navigate(location.pathname, { replace: false });
    }
    useEffect(() => {
        if (!location.search.includes('viewing=true') && isViewing) {
            onClose();
        }
    }, [location.search])
    
    return (
        <Container>
            <DraftWarning />
            <Typography align='center' gutterBottom variant="h4" component="h4">
                {election.title}
            </Typography>
            <Typography align='center' gutterBottom variant="h5" component="h5">
                View Ballots
            </Typography>
            {isPending && <div> Loading Data... </div>}
            {data && data.ballots && !isViewing && !addRollPage &&
                <>
                    <TableContainer component={Paper}>
                        <Table style={{ width: '100%' }} aria-label="simple table">
                            <TableHead>
                                <TableRow >
                                    <TableCell colSpan={3}></TableCell>
                                    {election.races.map(race => (
                                        <TableCell align='center' sx={{borderWidth: 1, borderTopWidth: 0, borderColor: 'lightgray', borderStyle: 'solid'}}  colSpan={race.candidates.length}>
                                            {race.title}
                                        </TableCell>
                                    ))}
                                </TableRow>

                            </TableHead>
                            <TableHead>
                                <TableCell> Ballot ID </TableCell>
                                {flags.isSet('VOTER_FLAGGING') &&
                                    <TableCell> Precinct </TableCell>
                                }
                                <TableCell> Status </TableCell>
                                {election.races.map((race) => (
                                    race.candidates.map((candidate) => (
                                        <TableCell>
                                            {candidate.candidate_name}
                                        </TableCell>
                                    ))
                                ))}
                                <TableCell> View </TableCell>
                            </TableHead>
                            <TableBody>
                                {data.ballots.map((ballot) => (
                                    <TableRow key={ballot.ballot_id} >
                                        <TableCell component="th" scope="row">{ballot.ballot_id}</TableCell>
                                        {flags.isSet('VOTER_FLAGGING') &&
                                            <TableCell >{ballot.precinct || ''}</TableCell>
                                        }
                                        <TableCell >{ballot.status.toString()}</TableCell>
                                        {ballot.votes.map((vote) => (
                                            vote.scores.map((score) => (
                                                <TableCell >{score.score || ''}</TableCell>
                                            ))))}
                                        <TableCell ><SecondaryButton onClick={() => onOpen(ballot)} > View </SecondaryButton></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <BallotDataExport election={election}/>
                </>
            }
            {isViewing && selectedBallot &&
                <ViewBallot ballot={selectedBallot} onClose={onClose} />
            }
        </Container>
    )
}

export default ViewBallots
