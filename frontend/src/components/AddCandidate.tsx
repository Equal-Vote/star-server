// import Button from "./Button"
import { useState } from 'react'
import { Candidate } from "../../../domain_model/Candidate"
import React from 'react'
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';

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

    const [editCandidate, setEditCandidate] = useState(false)

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
                    <Grid container direction="column">
                        <Grid item >
                            <TextField
                                id="short-name"
                                name="short name"
                                label="Short Name"
                                type="text"
                                value={candidateName}
                                onChange={(e) => setCandidateName(e.target.value)}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="bio"
                                name="bio"
                                label="Bio"
                                type="text"
                                multiline
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="long-name"
                                name="long name"
                                label="Full Name"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="candidate url"
                                name="candidate url"
                                label="Candidate URL"
                                type="url"
                                value={candidateUrl}
                                onChange={(e) => setCandidateUrl(e.target.value)}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="Party"
                                name="Party"
                                label="Party"
                                type="text"
                                value={party}
                                onChange={(e) => setParty(e.target.value)}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="party url"
                                name="party url"
                                label="Party URL"
                                type="url"
                                value={partyUrl}
                                onChange={(e) => setPartyUrl(e.target.value)}
                            />
                        </Grid>
                        <Button variant='outlined' onClick={() => saveCandidate()}>Save Candidate</Button>
                    </Grid>
                </div>
            }
            {!editCandidate &&
                <Grid container>
                    <Grid item xs={8}>
                        <Typography gutterBottom variant="h5" component="h5"> {candidateName} </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Button onClick={() => setEditCandidate(true)}>
                            <Typography variant="h6" component="h6"> Edit </Typography>
                        </Button>
                    </Grid>
                </Grid>
            }
        </div>
    )
}

export default AddCandidate
