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

const EditElectionRoll = ({ roll }) => {
    // I'm referencing 4th option here
    // https://daveceddia.com/usestate-hook-examples/


    const [updatedRoll, setUpdatedRoll] = useState(roll)
    // TODO: I need to figure out how to load previous voter ID list
    const [voterIDList, setVoterIDList] = useState('')
    const [titleError, setTitleError] = useState(false)

    const applyRollUpdate = (updateFunc) => {
        const electionCopy = structuredClone(updatedRoll)
        updateFunc(electionCopy)
        setUpdatedRoll(electionCopy)
    };

    const navigate = useNavigate()

    const onSubmit = (e) => {

    }

    const getDateString = (dateNum) => {
        const event = new Date(dateNum);
        return event.toLocaleString();
    }

    return (
        <form onSubmit={onSubmit}>
            <Container>
                <Grid container direction="column" >
                    <Grid item sm={12}>
                        <Typography align='left' gutterBottom variant="h6" component="h6">
                            {`Voter ID: ${updatedRoll.voter_id}`}
                        </Typography>
                    </Grid>
                    <Grid item sm={12}>
                        <Typography align='left' gutterBottom variant="h6" component="h6">
                            {`Has Voted: ${updatedRoll.submitted.toString()}`}
                        </Typography>
                    </Grid>
                    {updatedRoll.submitted &&
                        <Grid item sm={4}>
                            <Button variant='outlined' onClick={() => { }} > Invalidate Ballot </Button>
                        </Grid>}
                    {!updatedRoll.submitted &&
                        <Grid item sm={4}>
                            <Button variant='outlined' onClick={() => { }} > Delete </Button>
                        </Grid>}
                    <Grid container direction="column" >
                        <Grid item sm={12}>
                            <Grid container >
                                <Grid item sm={4}>
                                    <Typography align='left' gutterBottom variant="h6" component="h6">
                                        Action
                                    </Typography>
                                </Grid>
                                <Grid item sm={4}>
                                    <Typography align='left' gutterBottom variant="h6" component="h6">
                                        Actor
                                    </Typography>
                                </Grid>
                                <Grid item sm={4}>
                                    <Typography align='left' gutterBottom variant="h6" component="h6">
                                        Timestamp
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Divider light />
                        </Grid>
                        {updatedRoll.history.map((history) => (
                            <Grid item sm={12}>
                                <Grid container direction="row">
                                    <Grid item sm={4}>
                                        <Typography align='left' gutterBottom variant="h6" component="h6">
                                            {history.action}
                                        </Typography>
                                    </Grid>
                                    <Grid item sm={4}>
                                        <Typography align='left' gutterBottom variant="h6" component="h6">
                                            {history.actor}
                                        </Typography>
                                    </Grid>
                                    <Grid item sm={4}>
                                        <Typography align='left' gutterBottom variant="h6" component="h6">
                                            {getDateString(history.timestamp)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Divider light />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Container>
        </form>
    )
}

export default EditElectionRoll 
