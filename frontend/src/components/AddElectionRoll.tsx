import { useState } from "react"
import React from 'react'
import { Candidate } from "../../../domain_model/Candidate"
import AddCandidate from "./AddCandidate"
// import Button from "./Button"
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
// https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
// https://web.dev/structured-clone/
import structuredClone from '@ungap/structured-clone';
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import { Box, Checkbox, InputLabel } from "@material-ui/core"
import IconButton from '@material-ui/core/IconButton'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import useFetch from "../useFetch";

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
            const newRolls = await postRoll.makeRequest({electionRoll: rolls})
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
