import { useEffect, useState } from "react"
import { useParams } from "react-router";
import React from 'react'
import Button from "@mui/material/Button";
import Container from '@mui/material/Container';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import PermissionHandler from "../../PermissionHandler";
import ViewBallot from "./ViewBallot";
import { CSVLink } from "react-csv";
import { useGetBallots } from "../../../hooks/useAPI";
import { formatDate } from "../../util";
import useElection from "../../ElectionContextProvider";
import useFeatureFlags from "../../FeatureFlagContextProvider";

const ViewBallots = () => {
    const { election } = useElection()
    const { data, isPending, error, makeRequest: fetchBallots } = useGetBallots(election.election_id)
    const flags = useFeatureFlags();
    useEffect(() => { fetchBallots() }, [])
    const [isViewing, setIsViewing] = useState(false)
    const [addRollPage, setAddRollPage] = useState(false)
    const [selectedBallot, setSelectedBallot] = useState(null)
    const [csvData, setcsvData] = useState([])
    const [csvHeaders, setcsvHeaders] = useState([])

    const onOpen = (ballot) => {
        setIsViewing(true)
        setSelectedBallot({ ...ballot })
    }
    const onClose = (roll) => {
        setIsViewing(false)
        setAddRollPage(false)
        setSelectedBallot(null)
        fetchBallots()
    }

    const buildCsvData = () => {
        let header = [
            { label: 'ballot_id', key: 'ballot_id' },
            ...data.election.races[0].candidates.map((c) => ({ label: c.candidate_name, key: c.candidate_id }))
        ]
        let tempCsvData = data.ballots.map(ballot => {
            let row = {ballot_id: ballot.ballot_id}
            ballot.votes[0].scores.forEach(score => {
                row[score.candidate_id] = score.score
            });
            return row
        })
        setcsvHeaders(header)
        setcsvData(tempCsvData)
        return false
    }
    const limit = (string = '', limit = 0) => {
        if (!string) return ''
        return string.substring(0, limit)
    }
    return (
        <Container>
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
                                        <TableCell align='center' sx={{borderWidth: 1, borderColor: 'lightgray', borderStyle: 'solid'}}  colSpan={race.candidates.length}>
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
                                <TableCell> Date Submitted </TableCell>
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
                                        <TableCell >{formatDate(Number(ballot.date_submitted), election.settings.time_zone)}</TableCell>
                                        <TableCell >{ballot.status.toString()}</TableCell>
                                        {ballot.votes.map((vote) => (
                                            vote.scores.map((score) => (
                                                <TableCell >{score.score || ''}</TableCell>
                                            ))))}
                                        <TableCell ><Button variant='outlined' onClick={() => onOpen(ballot)} > View </Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <CSVLink
                        data={csvData}
                        headers={csvHeaders}
                        target="_blank"
                        filename={ `Ballot Data - ${limit(data.election.title, 50)}.csv`}
                        enclosingCharacter={``}
                        onClick={() => {
                            buildCsvData()
                        }}
                    >
                        Download CSV
                    </CSVLink>
                </>
            }
            {isViewing && selectedBallot &&
                <ViewBallot ballot={selectedBallot} onClose={onClose} />
            }
        </Container>
    )
}

export default ViewBallots
