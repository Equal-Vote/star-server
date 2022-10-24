// import Button from "./Button"
import { useState } from 'react'
import { Candidate } from "../../../../domain_model/Candidate"
import React from 'react'
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';

type CandidateProps = {
    onEditCandidate: Function,
    candidate: Candidate,
    index: number
}

const AddCandidate = ({ onEditCandidate, candidate, index }: CandidateProps) => {

    const [editCandidate, setEditCandidate] = useState(false)

    const onApplyEditCandidate = (updateFunc) => {
        const newCandidate = { ...candidate }
        console.log(newCandidate)
        updateFunc(newCandidate)
        onEditCandidate(newCandidate)
    }
    const handleEnter = (e) => {
        // Go to next entry instead of submitting form
        const form = e.target.form;
        const index = Array.prototype.indexOf.call(form, e.target);
        form.elements[index + 3].focus();
        e.preventDefault();
    }
    return (
        <>
            <Grid item xs={10} sx={{ display: "flex", alignItems:"center"}}>
                <TextField
                    id={`candidate-name-${String(index)}`}
                    name="new-candidate-name"
                    label="Name"
                    type="text"
                    value={candidate.candidate_name}
                    fullWidth
                    sx={{
                        px: 0,
                        boxShadow: 2,
                    }}
                    onChange={(e) => onApplyEditCandidate((candidate) => { candidate.candidate_name = e.target.value })}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleEnter(e)
                        }
                    }}
                />
            </Grid>
            {editCandidate ?
                <Grid item xs={2} sx={{ display: "flex", alignItems:"center"}}>
                    <Button
                        onClick={() => setEditCandidate(false)}
                        >
                        <Typography variant="h6" component="h6"> Save </Typography>
                    </Button>
                </Grid>
                :
                <Grid item xs={2} sx={{ display: "flex", alignItems:"center"}}>
                    <Button
                        onClick={() => setEditCandidate(true)}
                        >
                        <Typography variant="h6" component="h6"> Add Bio </Typography>
                    </Button>
                </Grid>}
            {editCandidate &&
                <>
                    <Grid item xs={10} >
                        <TextField
                            id="bio"
                            name="bio"
                            label="Bio"
                            type="text"
                            multiline
                            fullWidth
                            value={candidate.bio}
                            sx={{
                                my: { sm: 0, md: 1 },
                                p: 0,
                                boxShadow: 2,
                            }}
                            onChange={(e) => onApplyEditCandidate((candidate) => { candidate.bio = e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={10} sm={5}>
                        <TextField
                            id="long-name"
                            name="long name"
                            label="Full Name"
                            type="text"
                            value={candidate.full_name}
                            sx={{
                                my: { sm: 0, md: 1 },
                                p: 0,
                                boxShadow: 2,
                            }}
                            onChange={(e) => onApplyEditCandidate((candidate) => { candidate.full_name = e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={10} sm={5}>
                        <TextField
                            id="candidate url"
                            name="candidate url"
                            label="Candidate URL"
                            type="url"
                            value={candidate.candidate_url}
                            sx={{
                                my: { sm: 0, md: 1 },
                                p: 0,
                                boxShadow: 2,
                            }}
                            onChange={(e) => onApplyEditCandidate((candidate) => { candidate.candidate_url = e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={10} sm={5}>
                        <TextField
                            id="Party"
                            name="Party"
                            label="Party"
                            type="text"
                            value={candidate.party}
                            sx={{
                                my: { sm: 0, md: 1 },
                                p: 0,
                                boxShadow: 2,
                            }}
                            onChange={(e) => onApplyEditCandidate((candidate) => { candidate.party = e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={10} sm={5}>
                        <TextField
                            id="party url"
                            name="party url"
                            label="Party URL"
                            type="url"
                            value={candidate.partyUrl}
                            sx={{
                                my: { sm: 0, md: 1 },
                                p: 0,
                                boxShadow: 2,
                            }}
                            onChange={(e) => onApplyEditCandidate((candidate) => { candidate.partyUrl = e.target.value })}
                        />
                    </Grid>
                </>
            }
        </ >
    )
}

export default AddCandidate
