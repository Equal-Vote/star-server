import { useState } from "react"
import React from 'react'
import { useNavigate } from "react-router"
import { Election } from './../../../domain_model/Election'
import { Race } from "../../../domain_model/Race"
import { Candidate } from "../../../domain_model/Candidate"
import AddCandidate from "./AddCandidate"
// import Button from "./Button"
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Slider from "@material-ui/core/Slider";
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import { ElectionSettings } from "../../../domain_model/ElectionSettings"
import { Box, Checkbox, InputLabel } from "@material-ui/core"

const AddElection = ({ authSession }) => {
    const [electionName, setElectionName] = useState('')
    const [startDate, setStartDate] = useState('')
    const [stopDate, setStopDate] = useState('')
    const [description, setDescription] = useState('')
    const [votingMethod, setVotingMethod] = useState('STAR')
    const [numWinners, setNumWinners] = useState(1)
    const [candidates, setCandidates] = useState([] as Candidate[])
    const [voterRollType, setVoterRollType] = useState('None')
    const [voterIDType, setVoterIDType] = useState('IP Address')
    const [emailVerification, setEmailVerification] = useState(false)
    const [twoFactorAuth, setTwoFactorAuth] = useState(false)
    const [ballotUpdates, setBallotUpdates] = useState(false)
    const [publicResults, setPublicResults] = useState(true)
    const [voterIDList, setVoterIDList] = useState('')

    const navigate = useNavigate()

    const onAddElection = async (election) => {
        // try {
        const res = await fetch('/API/Elections', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Election: election,
                VoterIDList: voterIDList.split("\n"),
            })
        })
        if (!res.ok) {
            Error('Could not fetch data')
        }
        return res
        // console.log(res)
        // if (!res.ok) {
        //     throw Error('Could not fetch data')
        // }
        // console.log('Navigating')
        // } catch (error) {
        //     console.log(error)
        //     return
        // }
    }

    const onSubmit = (e) => {
        e.preventDefault()

        if (!electionName) {
            alert('Please add election name')
            return
        }
        const NewRace: Race = {
            race_id: '0',
            title: electionName,
            voting_method: votingMethod,
            num_winners: numWinners,
            candidates: candidates,
            description: description
        }
        const settings: ElectionSettings = {
            voter_roll_type: voterRollType,
            voter_id_type: voterIDType,
            email_verification: emailVerification,
            two_factor_auth: twoFactorAuth,
            ballot_updates: ballotUpdates,
            public_results: publicResults,
        }

        const NewElection: Election = {
            election_id: 0, // identifier assigned by the system
            frontend_url: '', // base URL for the frontend
            title: electionName, // one-line election title
            description: description, // mark-up text describing the election
            start_time: new Date(startDate),   // when the election starts 
            end_time: new Date(stopDate),   // when the election ends
            owner_id: authSession.getIdField('sub'),
            state: 'draft',
            races: [NewRace],
            settings: settings,
        }

        try {
            onAddElection(NewElection)
            navigate('/')
        } catch (error) {
            console.log(error)
        }
    }


    const onAddCandidate = () => {
        const newCandidates = [...candidates]
        const EmptyCandidate: Candidate = {
            candidate_id: String(newCandidates.length),
            candidate_name: '', // short mnemonic for the candidate
            full_name: '',
        }
        newCandidates.push(EmptyCandidate)
        setCandidates(newCandidates)
    }

    const onSaveCandidate = (candidate: Candidate, index) => {
        const newCandidates = [...candidates]
        newCandidates[index] = candidate
        setCandidates(newCandidates)
        console.log(candidates)
    }
    const onUpdateVoterRoll = (voterRoll: string) => {
        setVoterRollType(voterRoll)
        if (voterRoll === 'None') {
            setVoterIDType('IP Address')
            setVoterIDList('')
        } else if (voterRoll === 'Email') {
            setVoterIDType('Email')
        } else if (voterRoll === 'IDs') {
            setVoterIDType('IDs')
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <Container maxWidth='sm'>
                <Grid container alignItems="center" justify="center" direction="column" >
                    {/* <form className='add-form' onSubmit={onSubmit}> */}
                    <Grid item>
                        <TextField
                            id="election-name"
                            name="name"
                            label="Election Title"
                            type="text"
                            value={electionName}
                            onChange={(e) => setElectionName(e.target.value)}
                        />
                    </Grid>
                    {/* <div className='form-control'>
                    <label>Election Name</label>
                    <input type='text' placeholder='Election Name' value={electionName} onChange={(e) => setElectionName(e.target.value)} />
                </div> */}
                    {/* <div className='form-control'>
                    <label>Description</label>
                    <input type='text' placeholder='Description' value={description} onChange={(e) => setDescription(e.target.value)} />
                </div> */}
                    <Grid item>
                        <TextField
                            id="election-description"
                            name="description"
                            label="Description"
                            multiline
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Grid>
                    <div>
                        <label>Start Date</label>
                    </div>
                    <div>
                        <input type='datetime-local' placeholder='Add Name' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    {/* <Grid item>
                    <TextField
                        id="start-date"
                        name="start-date"
                        label="Start Date"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Grid> */}
                    <div >
                        <label>Stop Date</label>
                    </div>
                    <div>
                        <input type='datetime-local' placeholder='Add Name' value={stopDate} onChange={(e) => setStopDate(e.target.value)} />
                    </div>
                    {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DateTimePicker value={stopDate} onChange={(e) => setStopDate(String(e))} />
                </MuiPickersUtilsProvider> */}
                    <Grid item>
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
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>

                    {/* <div className='form-control'>
                    <label>Voting Method</label>
                    <select value={votingMethod} onChange={(e) => setVotingMethod(e.target.value)}>
                        <option value="STAR"> STAR </option>
                        <option value="STAR-PR"> STAR-PR </option>
                    </select>
                </div> */}
                    <Grid item>
                        <TextField
                            id="num-winners"
                            name="Number Of Winners"
                            label="Number of Winners"
                            type="number"
                            value={numWinners}
                            onChange={(e) => setNumWinners(parseInt(e.target.value))}
                        />
                    </Grid>
                    <Grid item>
                        <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth>
                                <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                    Voter Roll
                                </InputLabel>
                                <Select
                                    name="Voter Roll"
                                    label="Voter Roll"
                                    value={voterRollType}
                                    onChange={(e) => onUpdateVoterRoll(e.target.value as string)}
                                >
                                    <MenuItem key="None" value="None">
                                        None
                                    </MenuItem>
                                    <MenuItem key="Email" value="Email">
                                        Email
                                    </MenuItem>
                                    <MenuItem key="IDs" value="IDs">
                                        IDs
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                    {voterRollType === 'None' &&
                        
                            <Grid item>
                                <Box sx={{ minWidth: 120 }}>
                                    <FormControl fullWidth>
                                        <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                            Voter ID Type
                                        </InputLabel>
                                        <Select
                                            name="Voter ID"
                                            label="Voter ID"
                                            value={voterIDType}
                                            onChange={(e) => setVoterIDType(e.target.value as string)}
                                        >
                                            <MenuItem key="None" value="None">
                                                None
                                            </MenuItem>
                                            <MenuItem key="IP Address" value="IP Address">
                                                IP Address
                                            </MenuItem>
                                            <MenuItem key="Email" value="Email">
                                                Email (Requires Login)
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>
                            
                        }
                    {voterRollType === 'Email' &&
                        <Grid item>
                        <TextField
                            id="email-list"
                            name="email-list"
                            label="Email List"
                            multiline
                            type="text"
                            value={voterIDList}
                            onChange={(e) => setVoterIDList(e.target.value)}
                        />
                    </Grid>
                    }
                    {voterRollType === 'IDs' &&
                        <Grid item>
                        <TextField
                            id="id-list"
                            name="id-list"
                            label="Voter ID List"
                            multiline
                            type="text"
                            value={voterIDList}
                            onChange={(e) => setVoterIDList(e.target.value)}
                        />
                    </Grid>
                    }
                    <Grid item>
                        <FormControlLabel disabled control={
                            <Checkbox
                                id="email-verification"
                                name="Email Verification"
                                checked={emailVerification}
                                onChange={(e) => setEmailVerification(e.target.checked)}
                            />}
                            label="Email Verification"
                        />
                    </Grid>
                    <Grid item>
                        <FormControlLabel disabled control={
                            <Checkbox
                                id="two-factor-auth"
                                name="Two Factor Auth"
                                checked={twoFactorAuth}
                                onChange={(e) => setTwoFactorAuth(e.target.checked)}
                            />}
                            label="Two Factor Auth"
                        />
                    </Grid>
                    <Grid item>
                        <FormControlLabel disabled control={
                            <Checkbox
                                id="ballot-updates"
                                name="Ballot Updates"
                                checked={ballotUpdates}
                                onChange={(e) => setBallotUpdates(e.target.checked)}
                            />}
                            label="Ballot Updates"
                        />
                    </Grid>
                    <Grid item>
                        <FormControlLabel disabled control={
                            <Checkbox
                                id="public-results"
                                name="Public Results"
                                checked={publicResults}
                                onChange={(e) => setPublicResults(e.target.checked)}
                            />}
                            label="Public Results"
                        />
                    </Grid>
                    <Typography align='center' gutterBottom variant="h6" component="h6">
                        Candidates
                    </Typography>
                    {candidates.map((candidate, index) => (

                        <Grid item sm={12}>
                            <AddCandidate onSaveCandidate={(newCandidate) => onSaveCandidate(newCandidate, index)} candidate={candidate} index={index} />
                            <Divider light />
                        </Grid>
                    ))}
                    <Button variant='outlined' onClick={() => onAddCandidate()} > Add Candidate </Button>
                    <input type='submit' value='Create Election' className='btn btn-block' />
                </Grid>
            </Container>
        </form>
    )
}

export default AddElection
