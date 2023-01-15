import React, { useState } from 'react'
import Results from './Election/Results/Results';
import { Grid } from "@mui/material";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { Box, InputLabel } from "@mui/material";
import { io } from "socket.io-client";
import BallotSelector from './Election/Voting/BallotSelector';
import { useLocalStorage } from '../hooks/useLocalStorage';

const socket = io();

const Demo = () => {
    const [tempID, setTempID] = useLocalStorage('tempID', null)
    const [candidates, setCandidates] = useState('A,B,C,D,E')
    const [nWinners, setNWinners] = useState(1)
    const [votingMethod, setVotingMethod] = useState('STAR')
    const [roomName, setRoomName] = useState('')
    const [roomData, setRoomData] = useState(null)
    const [showSettings, setShowSettings] = useState(true)
    const [ballot, setBallot] = useState(null)

    const createRoom = () => {
        if (roomName === '') return
        if (candidates === '') return
        socket.emit("create-room", { roomname: roomName, candidates: candidates.split(","), methods: { star: true }, nWinners: nWinners })
    }
    const joinRoom = () => {
        if (roomName === '') return
        setShowSettings(false)
        socket.emit("join-room", roomName)
    }

    const vote = () => {
        socket.emit('vote', roomData.roomname, ballot)
    }

    socket.off("update-room").on("update-room", data => {
        console.log(data)
        setRoomData(data)
        if (ballot === null) {
            let newBallot = ballot
            newBallot = {}
            newBallot.id = tempID
            newBallot.star = new Array(data.candidates.length).fill(null)
            setBallot(newBallot)
        }
    })

    return (
        <Grid container>
            {showSettings &&
                <>
                    <Grid item xs={12}>
                        <InputLabel variant="standard" htmlFor="uncontrolled-native">
                            Room Name
                        </InputLabel>
                        <TextField
                            id="roomName"
                            name="roomName"
                            multiline
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth>
                                <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                    Voting Method
                                </InputLabel>
                                <Select
                                    name="Voting Method"
                                    label="Voting Method"
                                    value={votingMethod}
                                    onChange={(e) => setVotingMethod(e.target.value as string)}
                                >
                                    <MenuItem key="STAR" value="STAR">
                                        STAR
                                    </MenuItem>
                                    <MenuItem key="STAR-PR" value="STAR-PR">
                                        STAR-PR
                                    </MenuItem>
                                    <MenuItem key="Ranked-Robin" value="Ranked-Robin">
                                        Ranked Robin
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel variant="standard" htmlFor="uncontrolled-native">
                            Number of Winners
                        </InputLabel>
                        <TextField
                            id="num-winners"
                            name="Number Of Winners"
                            type="number"
                            value={nWinners}
                            onChange={(e) => setNWinners(parseInt(e.target.value))}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel variant="standard" htmlFor="uncontrolled-native">
                            Candidates
                        </InputLabel>
                        <TextField
                            id="candidates"
                            name="candidates"
                            multiline
                            type="text"
                            value={candidates}
                            helperText="Comma seperated list of candidates"
                            onChange={(e) => setCandidates(e.target.value)}
                        />
                    </Grid>
                </>}
            <Grid item xs={12} sm={1}>
            </Grid>
            {roomData === null &&
                <>
                    <Button variant='outlined' onClick={() => createRoom()} > Create Room </Button>
                    <Button variant='outlined' onClick={() => joinRoom()} > Join Room </Button>
                </>
            }
            {roomData && ballot &&
                <Grid item xs={12} sm={4}>
                    <BallotSelector
                        race={{ num_winners: roomData.nWinners, voting_method: 'STAR' }}
                        candidates={roomData.candidates.map(name => ({ candidate_name: name }))}
                        onUpdate={votes => setBallot({ ...ballot, star: votes })}
                        scores={ballot.star}
                    />
                    <Button variant='outlined' onClick={() => vote()} > Vote </Button>
                </Grid>
            }
            <Grid item xs={12} sm={2}>
            </Grid>
            {roomData && roomData.results &&
                <Grid item xs={12} sm={4}>
                    <Results
                        race={{ num_winners: roomData.nWinners, voting_method: 'STAR' }}
                        result={roomData.results} />
                </Grid>
            }
            <Grid item xs={12} sm={1}>
            </Grid>
        </Grid>
    )
}
export default Demo