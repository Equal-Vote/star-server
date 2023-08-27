import { useState, useRef } from "react"
import React from 'react'
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import { usePostRolls } from "../../../hooks/useAPI";


const AddElectionRoll = ({ election, onClose }) => {

    const [voterIDList, setVoterIDList] = useState('')
    const postRoll = usePostRolls(election.election_id)
    const [file, setFile] = useState()
    const fileReader = new FileReader()
    const [enableVoterID, setEnableVoterID] = useState(false)
    const [enableEmail, setEnableEmail] = useState(true)
    const [enablePrecinct, setEnablePrecinct] = useState(false)
    const inputRef = useRef(null)

    const submitRolls = async (rolls) => {

        const newRolls = await postRoll.makeRequest({ electionRoll: rolls })
        console.log(rolls)
        if (!newRolls) {
            throw Error("Error submitting rolls");
        }
        onClose()
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const rows = voterIDList.split('\n')
            const rolls = []
            const expectedCounts = Number(enableVoterID) + Number(enableEmail) + Number(enablePrecinct)
            rows.forEach((row) => {
                const csvSplit = row.split(',')
                if (csvSplit.length !== expectedCounts) {
                    alert(`Incorrect number of columns: ${row}`)
                    return
                }
                let count = 0
                let roll = {
                    state: 'approved',
                    voter_id: undefined,
                    email: undefined,
                    precinct: undefined,
                }
                if (enableVoterID){
                    roll.voter_id = csvSplit[count]
                    count += 1
                }   
                if (enableEmail){
                    roll.email = csvSplit[count]
                    count += 1
                }           
                if (enablePrecinct){
                    roll.precinct = csvSplit[count]
                    count += 1
                }       
                rolls.push(roll)
            })
            console.log(rolls)
            submitRolls(rolls)
        } catch (error) {
            console.log(error)
        }
    }
    const handleLoadCsv = (e) => {
        e.preventDefault()
        fileReader.onload = function (event) {
            let text = event.target.result;
            if (typeof text !== "string") {
                alert('Invalid data type')
                return
            }
            text = text.replaceAll(/\r\n|\r/g, '\n'); //make line break characters consistent
            const csvHeader = text.slice(0, text.indexOf("\n")).split(",");
            const areHeadersValid = csvHeader.every(val => ['voter_id', 'email', 'precinct'].includes(val))
            if (!areHeadersValid) {
                alert('Invalid headers')
                return
            }
            const csvRows = text.slice(text.indexOf("\n") + 1).split("\n");
            const rolls = csvRows.map(i => {
                const values = i.split(",");
                const obj = csvHeader.reduce((object, header, index) => {
                    object[header] = values[index];
                    return object;
                }, { state: 'approved' });
                return obj;
            });
            submitRolls(rolls)
        };
        fileReader.readAsText(e.target.files[0]);
    }

    return (
        <form onSubmit={onSubmit}>
            <Container maxWidth='sm'>
                <Grid container direction="column" >

                    <Typography align='center' gutterBottom variant="h6" component="h6">
                        Enter voter data
                    </Typography>

                    <Typography align='center' component="p">
                        Enter your voter roll data in the field below. Check which fields you will be entering and enter one voter per line with fields seperated by commas, without spaces, in the order checked.
                    </Typography>

                    <Grid item sx={{ p: 1 }}>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        id="enable-voter-id"
                                        name="Voter ID"
                                        checked={enableVoterID}
                                        onChange={(e) => setEnableVoterID(e.target.checked)} />
                                }
                                label='Voter ID'
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        id="enable-email"
                                        name="Email"
                                        checked={enableEmail}
                                        onChange={(e) => setEnableEmail(e.target.checked)} />
                                }
                                label='Email'
                            />
                            {process.env.REACT_APP_FF_PRECINCTS === 'true' &&
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            id="enable-precinct"
                                            name="Precinct"
                                            checked={enablePrecinct}
                                            onChange={(e) => setEnablePrecinct(e.target.checked)} />
                                    }
                                    label='Precinct'
                                />
                            }
                        </FormGroup>
                    </Grid>
                    <Grid item sx={{ p: 1 }}>
                        <TextField
                            id="email-list"
                            name="email-list"
                            label="Voter Data"
                            multiline
                            fullWidth
                            type="text"
                            value={voterIDList}
                            onChange={(e) => setVoterIDList(e.target.value)}
                        />
                    </Grid>

                    <Grid item sx={{ m: 1 }}>
                        <Button
                            variant='contained'
                            type='submit'
                            fullWidth
                            disabled={postRoll.isPending} >
                            Submit
                        </Button>
                    </Grid>
                    <Grid item sx={{ my: 1 }}>
                        <Divider />
                    </Grid>
                    <Grid item sx={{ m: 1 }}>
                        <Typography align='center' gutterBottom variant="h5" component="h5">
                            OR
                        </Typography>
                        <Typography align='center' gutterBottom variant="h6" component="h6">
                            Upload CSV
                        </Typography>
                        <Typography align='center' component="p">
                            Upload a csv file of your voter data. Files can include voter IDs, email addresses, and precincts. Files must include headers with the expected spelling:voter_id,email,precinct.
                        </Typography>
                    </Grid>
                    <Grid item sx={{ m: 1 }}>
                        <Box justifyContent={'center'} alignItems={'center'}>
                            <input
                                type='file'
                                accept={'.csv'}
                                onChange={handleLoadCsv}
                                hidden
                                ref={inputRef} />
                            <Button
                                variant='outlined'
                                fullWidth
                                onClick={() => inputRef.current.click()} >
                                <Typography variant="h6" component="h6">
                                    Select File
                                </Typography>
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item sm={4} sx={{ m: 1 }}>
                        <Button variant='outlined' onClick={() => { onClose() }} > Close </Button>
                    </Grid>
                </Grid>
            </Container >
        </form >
    )
}

export default AddElectionRoll 
