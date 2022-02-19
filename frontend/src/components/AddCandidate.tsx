// import Button from "./Button"
import { Link } from "react-router-dom"
import { useState } from 'react'
import { Candidate } from "../../../domain_model/Candidate"
import React from 'react'
import { MouseEventHandler } from 'react'
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
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Box from '@material-ui/core/Box'

type CandidateProps = {
    onSaveCandidate: Function,
    candidate: Candidate,
    index: Number
}

const AddCandidate = ({ onSaveCandidate, candidate, index }: CandidateProps) => {
    const [candidateIndex, setCandidateIndex] = useState(index)
    const [candidateName, setCandidateName] = useState(candidate.candidate_name)
    const [fullName, setFullName] = useState(candidate.full_name)
    const [party, setParty] = useState(candidate.party)
    const [candidateUrl, setCandidateUrl] = useState(candidate.candidate_url)
    const [partyUrl, setPartyUrl] = useState(candidate.partyUrl)
    const [bio, setBio] = useState(candidate.bio)

    const [editCandidate, setEditCandidate] = useState(true)

    const saveCandidate = () => {
        const newCandidate: Candidate = {
            candidate_id: String(candidateIndex),
            candidate_name: candidateName,
            full_name: fullName,
            party: party,
            candidate_url: candidateUrl,
            partyUrl: partyUrl,
            bio: bio
        }
        console.log(newCandidate)
        setEditCandidate(false)
        onSaveCandidate(newCandidate)
    }
    

    return (
      <div>
        {/* <Card >
            <CardContent> */}
            {editCandidate &&
            <div className="card">
                <Grid container alignItems="center" justify="center" direction="column">
                {/* <form className='add-form' onSubmit={onSubmit}> */}
                <Grid item >
                    <TextField
                        id="short-name"
                        name="short name"
                        label="Short Name"
                        type="text"
                        value={candidateName}
                        onChange={(e) => setCandidateName( e.target.value )}
                    />
                </Grid>
                {/* <div className='form-control'>
                    <label>Short Name</label>
                    <input type='text' placeholder='Add Short name' value={shortName} onChange={(e) => setCandidateName(e.target.value)} />
                </div> */}
                <Grid item>
                    <TextField
                        id="bio"
                        name="bio"
                        label="Bio"
                        type="text"
                        multiline
                        value={bio}
                        onChange={(e) => setBio( e.target.value )}
                    />
                </Grid>
                {/* <div className='form-control'>
                    <label>Bio</label>
                    <textarea placeholder='Add Bio' value={bio} onChange={(e) => setBio(e.target.value)} />
                </div> */}
                <Grid item>
                    <TextField
                        id="long-name"
                        name="long name"
                        label="Full Name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName( e.target.value )}
                    />
                </Grid>
                {/* <div className='form-control'>
                    <label>Long Name</label>
                    <input type='text' placeholder='Add Full name' value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div> */}
                <Grid item>
                    <TextField
                        id="candidate url"
                        name="candidate url"
                        label="Candidate URL"
                        type="url"
                        value={candidateUrl}
                        onChange={(e) => setCandidateUrl( e.target.value )}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        id="Party"
                        name="Party"
                        label="Party"
                        type="text"
                        value={party}
                        onChange={(e) => setParty( e.target.value )}
                    />
                </Grid>
                {/* <div className='form-control'>
                    <label>Party</label>
                    <input type='text' placeholder='Add Party' value={party} onChange={(e) => setParty(e.target.value)} />
                </div> */}
                {/* <div className='form-control'>
                    <label>Candidate URL</label>
                    <input type='url' placeholder='Add Candidate URL' value={candidateUrl} onChange={(e) => setCandidateUrl(e.target.value)} />
                </div> */}
                <Grid item>
                    <TextField
                        id="party url"
                        name="party url"
                        label="Party URL"
                        type="url"
                        value={partyUrl}
                        onChange={(e) => setPartyUrl( e.target.value )}
                    />
                </Grid>
                {/* <div className='form-control'>
                    <label>Party URL</label>
                    <input type='url' placeholder='Add Party URL' value={partyUrl} onChange={(e) => setPartyUrl(e.target.value)} />
                </div> */}
                <Button variant = 'outlined' onClick= { () => saveCandidate() }>Save Candidate</Button>
                </Grid>
            </div>
            }
            {!editCandidate &&
            <div >
                <Typography align='center' gutterBottom variant="h5" component="h5"> {candidateName} </Typography>
                <Box textAlign='center'>
                <Button onClick= { () => setEditCandidate(true) }>Edit</Button>
                </Box>
                </div>
            }
            {/* </CardContent>
        </Card> */}
        </div>
    )
}

export default AddCandidate
