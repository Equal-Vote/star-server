import { useState } from "react"
import React from 'react'
import { Candidate } from "../../../../../domain_model/Candidate"
import AddCandidate from "../../ElectionForm/AddCandidate"
// import Button from "./Button"
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
// https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
// https://web.dev/structured-clone/
import structuredClone from '@ungap/structured-clone';
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import { Box, Checkbox, InputLabel } from "@material-ui/core"
import IconButton from '@mui/material/IconButton'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import useFetch from "../../../hooks/useFetch";

const AddElectionRoll = ({ election, onClose }) => {

    const [voterIDList, setVoterIDList] = useState('')
    const postRoll = useFetch(`/API/Election/${election.election_id}/rolls/`, 'post')

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const rows = voterIDList.split('\n')
            const rolls = []
            rows.forEach((row) => {
                const csvSplit = row.split(',')
                console.log(csvSplit)
                if (csvSplit.length === 1) {
                    rolls.push({
                        voter_id: csvSplit[0],
                        state: 'approved',
                    })
                }
                else if (csvSplit.length >= 2) {
                    rolls.push({
                        voter_id: csvSplit[0],
                        precinct: csvSplit[1],
                        state: 'approved',
                    })
                }
            })
            const newRolls = await postRoll.makeRequest({ electionRoll: rolls })
            console.log(rolls)
            if (!newRolls) {
                throw Error("Error submitting rolls");
            }
            onClose()

        } catch (error) {
            console.log(error)
        }
    }


    return (
        <form onSubmit={onSubmit}>
            <Container maxWidth='sm'>
                <Grid container direction="column" >

                    <Grid item>
                        <TextField
                            id="email-list"
                            name="email-list"
                            label="Email List"
                            multiline
                            fullWidth
                            type="text"
                            value={voterIDList}
                            onChange={(e) => setVoterIDList(e.target.value)}
                            helperText="One email per line, to specify precint write email and precint separated by comma (joe@email.com,precintA)"
                        />
                    </Grid>

                    {/* 
                        // <Grid item>
                        //     <TextField
                        //         id="id-list"
                        //         name="id-list"
                        //         label="Voter ID List"
                        //         multiline
                        //         fullWidth
                        //         type="text"
                        //         value={voterIDList}
                        //         onChange={(e) => setVoterIDList(e.target.value)}
                        //         helperText="One ID per line, to specify precint write ID and precint separated by comma (ID1234,precintA)"
                        //     />
                        // </Grid> 
                        */}

                    <input
                        type='submit'
                        value='Submit'
                        className='btn btn-block'
                        disabled={postRoll.isPending} />
                </Grid>
                <Grid item sm={4}>
                    <Button variant='outlined' onClick={() => { onClose() }} > Close </Button>
                </Grid>
            </Container>
        </form>
    )
}

export default AddElectionRoll 
