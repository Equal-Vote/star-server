import { useState } from "react"
import React from 'react'
import { useNavigate } from "react-router"
import { Election } from '../../../domain_model/Election'
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
// https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
// https://web.dev/structured-clone/
import structuredClone from '@ungap/structured-clone';
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Slider from "@material-ui/core/Slider";
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import { ElectionSettings } from "../../../domain_model/ElectionSettings"
import { Box, Checkbox, InputLabel } from "@material-ui/core"
import { isReturnStatement } from "typescript"
import IconButton from '@material-ui/core/IconButton'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

const ElectionForm = ({authSession, onSubmitElection, prevElectionData, submitText}) => {
    // I'm referencing 4th option here
    // https://daveceddia.com/usestate-hook-examples/

    if(prevElectionData == null){
        prevElectionData = {
            title: '',
            election_id: 0,
            start_time: new Date(''),
            end_time: new Date(''),
            description: '',
            races: [
                {
                    num_winners: 1,
                    voting_method: 'STAR',
                    candidates: [] as Candidate[],
                }
            ],
            settings: {
                voter_id_type: 'IP Address',
                email_verification: false,
                two_factor_auth: false,
                ballot_updates: false,
                public_results: true,
                election_roll_type: 'None'
            }
        }
    }

    const [election, setElectionData] = useState(prevElectionData)
    // TODO: I need to figure out how to load previous voter ID list
    const [voterIDList, setVoterIDList] = useState('')
    const [titleError, setTitleError] = useState(false)
    const [newCandidateName, setNewCandidateName] = useState('')
    const [expandedSettings, setExpandedSettings] = useState(false)

    const applyElectionUpdate = (updateFunc) => {
        const electionCopy = structuredClone(election)
        updateFunc(electionCopy)
        setElectionData(electionCopy)
    };

    const getStyle = (...keys) => {
        var cur = election;
        var prev = prevElectionData;
        keys.forEach(key => {
            cur = cur[key]
            prev = prev[key]
        })
        return {style: {fontWeight: (cur == prev)? 'normal' : 'bold' }}
    }

    const dateAsInputString = (date) => {
        // TODO: Using ISO create a bug with timezones
        //       ex. If I select April 20th late in the PDT timezone, that's April 21th in UTC/ISO, so it sets April 21
        if(date == null) return ''
        if(isNaN(date.valueOf())) return ''
        var s = date.toISOString()
        // the timezone offset throws off the input component
        s = s.replace(':00.000Z','')
        return s
    }

    const navigate = useNavigate()

    const onSubmit = (e) => {
        e.preventDefault()

        if (!election.title) {
            setTitleError(true);
            return;
        }

        // This assigns only the new fields, but otherwise keeps the existing election fields
        const newElection = {
            ...election,
            frontend_url: '', // base URL for the frontend
            owner_id: authSession.getIdField('sub'),
            state: 'draft',
            races: [
                {
                    ...election.races[0],
                    race_id: '0',
                    title: election.title,
                    description: election.description,
                }
            ]
        }

        try {
            onSubmitElection(newElection, voterIDList.split('\n'))
            navigate('/')
        } catch (error) {
            console.log(error)
        }
    }

    const onAddCandidate = () => {
        applyElectionUpdate(election => {
            election.races[0].candidates.push(
                {
                    candidate_id: String(election.races[0].candidates.length),
                    candidate_name: newCandidateName, // short mnemonic for the candidate
                    full_name: '',
                }
            )
        })
        setNewCandidateName('')
    }

    const onSaveCandidate = (candidate: Candidate, index) => {
        applyElectionUpdate(election => {
            election.races[0].candidates[index] = candidate
        })
    }
    const onUpdateElectionRoll = (voterRoll: string) => {
        applyElectionUpdate(election => {
            election.settings.election_roll_type = voterRoll;
            if (voterRoll === 'None') {
                election.settings.voter_id_type = 'IP Address';
                setVoterIDList('')
            } else if (voterRoll === 'Email') {
                election.settings.voter_id_type = 'Email';
            } else if (voterRoll === 'IDs') {
                election.settings.voter_id_type = 'IDs';
            }
        })
    }

    return (
        <form onSubmit={onSubmit}>
            <Container maxWidth='sm'>
                <Grid container direction="column" >
                    <Grid item>
                        <TextField
                            error={titleError}
                            helperText={titleError?"Election name is required":""}
                            id="election-name"
                            name="name"
                            // TODO: This bolding method only works for the text fields, if we like it we should figure out a way to add it to other fields as well
                            inputProps={getStyle('title')}
                            label="Election Title"
                            type="text"
                            value={election.title}
                            onChange={(e) => {
                                setTitleError(false)
                                applyElectionUpdate(election => {election.title = e.target.value})
                            }}
                        />
                    </Grid>
                    <Grid container alignItems="center">
                        <Grid item sm={11}>
                            <Typography gutterBottom variant="h6" component="h6">Election Settings</Typography>
                        </Grid>
                        {!expandedSettings &&
                                <Grid item sm={1}>
                                    <IconButton aria-label="Home" onClick={() => { setExpandedSettings(true) }}>
                                        <ExpandMore />
                                    </IconButton>
                                </Grid>}
                        {expandedSettings &&
                            <Grid item sm={1}>
                            <IconButton aria-label="Home" onClick={() => { setExpandedSettings(false) }}>
                            <ExpandLess />
                            </IconButton>
                            </Grid>}
                    </Grid>
                    
                    {expandedSettings &&
                        <div>
                    <Grid item>
                        <TextField
                            id="election-description"
                            name="description"
                            label="Description"
                            inputProps={getStyle('description')}
                            multiline
                            type="text"
                            value={election.description}
                            onChange={(e) => applyElectionUpdate(election => {election.description = e.target.value})}
                        />
                    </Grid>
                    <div>
                        <label>Start Date</label>
                    </div>
                    <div>
                        <input
                            type='datetime-local'
                            placeholder='Add Name'
                            value={dateAsInputString(election.start_time)}
                            onChange={(e) => applyElectionUpdate(election => election.start_time = new Date(e.target.value))}
                        />
                    </div>
                    <div >
                        <label>Stop Date</label>
                    </div>
                    <div>
                        <input
                            type='datetime-local'
                            placeholder='Add Name'
                            value={dateAsInputString(election.end_time)}
                            onChange={(e) => applyElectionUpdate(election => {election.end_time = new Date(e.target.value)})}
                        />
                    </div>
                    <Grid item>
                        <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth>
                                <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                    Election Roll
                                </InputLabel>
                                <Select
                                    name="Election Roll"
                                    label="Election Roll"
                                    value={election.settings.election_roll_type}
                                    onChange={(e) => onUpdateElectionRoll(e.target.value as string)}
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
                    {election.settings.election_roll_type === 'None' &&
                            <Grid item>
                                <Box sx={{ minWidth: 120 }}>
                                    <FormControl fullWidth>
                                        <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                            Voter ID Type
                                        </InputLabel>
                                        <Select
                                            name="Voter ID"
                                            label="Voter ID"
                                            value={election.settings.voter_id_type}
                                            onChange={(e) => applyElectionUpdate(election => {election.settings.voter_id_type = e.target.value})}
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
                    {election.settings.election_roll_type === 'Email' &&
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
                    {election.settings.election_roll_type === 'IDs' &&
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
                                checked={election.settings.email_verification}
                                onChange={(e) => applyElectionUpdate(election => {election.settings.email_verification = e.target.value})}
                            />}
                            label="Email Verification"
                        />
                    </Grid>
                    <Grid item>
                        <FormControlLabel disabled control={
                            <Checkbox
                                id="two-factor-auth"
                                name="Two Factor Auth"
                                checked={election.settings.two_factor_auth}
                                onChange={(e) => applyElectionUpdate(election => {election.settings.two_factor_auth = e.target.value})}
                            />}
                            label="Two Factor Auth"
                        />
                    </Grid>
                    <Grid item>
                        <FormControlLabel disabled control={
                            <Checkbox
                                id="ballot-updates"
                                name="Ballot Updates"
                                checked={election.settings.ballot_updates}
                                onChange={(e) => applyElectionUpdate(election => {election.settings.ballot_updates = e.target.value})}
                            />}
                            label="Ballot Updates"
                        />
                    </Grid>
                    <Grid item>
                        <FormControlLabel disabled control={
                            <Checkbox
                                id="public-results"
                                name="Public Results"
                                checked={election.settings.public_results}
                                onChange={(e) => applyElectionUpdate(election => {election.settings.public_results = e.target.value})}
                            />}
                            label="Public Results"
                        />
                    </Grid>
                    </div>}
                    <Divider light />
                    <Typography gutterBottom variant="h6" component="h6">Race Settings</Typography>
                    <Grid item>
                        <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth>
                                <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                    Voting Method
                                </InputLabel>
                                <Select
                                    name="Voting Method"
                                    label="Voting Method"
                                    value={election.races[0].voting_method}
                                    onChange={(e) => applyElectionUpdate(election => {election.races[0].voting_method = e.target.value})}
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
                    <Grid item>
                        <TextField
                            id="num-winners"
                            name="Number Of Winners"
                            label="Number of Winners"
                            inputProps={getStyle('races', 0, 'num_winners')}
                            type="number"
                            value={election.races[0].num_winners}
                            onChange={(e) => applyElectionUpdate(election => {election.races[0].num_winners = e.target.value})}
                        />
                    </Grid>
                    <Divider light />
                    <Typography gutterBottom variant="h6" component="h6">
                        Candidates
                    </Typography>
                    {election.races[0].candidates.map((candidate, index) => (
                        <Grid item sm={12}>
                            <AddCandidate onSaveCandidate={(newCandidate) => onSaveCandidate(newCandidate, index)} candidate={candidate} index={index} />
                            <Divider light />
                        </Grid>
                    ))}
                    <Grid container>
                    <Grid item sm={8}>
                        <TextField
                            id="new-candidate-name"
                            name="new-candidate-name"
                            label="New Candidate Name"
                            type="text"
                            value={newCandidateName}
                            fullWidth
                            onChange={(e) => {
                                setNewCandidateName(e.target.value)
                            }}
                            onKeyPress={(ev) => {
                                if (ev.key === 'Enter') {
                                    onAddCandidate()
                                    ev.preventDefault();
                                }
                              }}
                        />
                    </Grid>
                    <Grid item sm={4}>
                    <Button variant='outlined' onClick={() => onAddCandidate()} >Add</Button>
                    </Grid>
                    </Grid>
                    <input type='submit' value={submitText} className='btn btn-block' />
                </Grid>
            </Container>
        </form>
    )
}

export default ElectionForm 
