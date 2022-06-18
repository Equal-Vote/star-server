import React, { useState } from 'react'
import { useParams } from "react-router";
import useFetch from "../useFetch";
import Results from './Results';
import { Grid } from "@material-ui/core";
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

const Sandbox = () => {
    const [candidates, setCandidates] = useState('A,B,C,D,E')
    const [cvr, setCvr] = useState('10:0,1,3,4,5\n10:5,4,3,1,0\n0,2,5,4,1')
    const [nWinners, setNWinners] = useState(1)
    const [votingMethod, setVotingMethod] = useState('STAR')
    const [isPending, setIsPending] = useState(true)
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)

    const getCvr = () => {

        const cvrRows = cvr.split("\n")
        const cvrSplit = cvrRows.map((row) => (row.split(',').map((score) => parseInt(score))))
        console.log(cvrSplit)
    }

    const getResults = async () => {
        const cvrRows = cvr.split("\n")
        const cvrSplit = [];
        cvrRows.forEach((row) => {
            const data = row.split(':')
            if (data.length == 2) {
                const nBallots = parseInt(data[0]);
                const vote = data[1].split(/[\s,]+/).map((score) => parseInt(score))
                cvrSplit.push(...Array(nBallots).fill(vote))
            } else {
                const vote = data[0].split(/[\s,]+/).map((score) => parseInt(score))
                cvrSplit.push(vote)
            }
        })
        console.log(cvrSplit)
        const res = await fetch('/API/Sandbox', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cvr: cvrSplit,
                candidates: candidates.split(","),
                num_winners: nWinners
            })
        }).then(res => {
            if (!res.ok) {
                throw Error('Could not fetch data')
            }
            return res.json();
        })
            .then(data => {
                setData(data);
                setIsPending(false);
                setError(null);
            })
            .catch(err => {
                setIsPending(false);
                setError(err.message);
            })
    }
    console.log(data)
    return (
        //Using grid to force results into the center and fill screen on smaller screens.
        //Using theme settings and css can probably replace the grids
        <Grid container spacing={0}>
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
                    helperText = "Comma seperated list of candidates"
                    onChange={(e) => setCandidates(e.target.value)}
                />
            </Grid>
            <Grid item xs={12}>
                <InputLabel variant="standard" htmlFor="uncontrolled-native">
                    Votes
                </InputLabel>
                <TextField
                    id="cvr"
                    name="cvr"
                    multiline
                    rows="5"
                    type="text"
                    value={cvr}
                    helperText = "Comma seperated scores, one ballot per line, optional 'x:' in front of ballot to indicate x number of that ballot"
                    onChange={(e) => setCvr(e.target.value)}
                />
            </Grid>
            <Button variant='outlined' onClick={() => getResults()} > Get Results </Button>
            <Grid item xs={12}>
            </Grid>
            <Grid item xs={12}>
                <Box border={2} sx={{ mt: 5, width: '100%', p: 2 }}>
                    {error && <div> {error} </div>}
                    {isPending && <div> Loading Results... </div>}
                    {data && (
                        <Results data={{
                            Results: data.Results,
                            Election: {
                                title: '',
                                races: [
                                    {
                                        candidates: candidates.split(',').map((candidate) => [{ candidate_name: candidate }]),
                                        voting_method: votingMethod,
                                        num_winners: nWinners,
                                    }
                                ]
                            }
                        }} />)}
                </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
            </Grid>
        </Grid>
    )
}
export default Sandbox