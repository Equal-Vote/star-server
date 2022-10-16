import { useState } from "react"
import React from 'react'
import { Candidate } from "../../../../domain_model/Candidate"
// import Button from "./Button"
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
// https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
// https://web.dev/structured-clone/
import structuredClone from '@ungap/structured-clone';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import Settings from "./Settings";
import Races from "./Races";

const ElectionForm = ({authSession, onSubmitElection, prevElectionData, submitText, disableSubmit}) => {
    // I'm referencing 4th option here
    // https://daveceddia.com/usestate-hook-examples/

    if(prevElectionData == null){
        prevElectionData = {
            title: '',
            election_id: '0',
            start_time: new Date(''),
            end_time: new Date(''),
            description: '',
            races: [
                {   
                    race_id: '0',
                    title: '',
                    description: '',
                    num_winners: 1,
                    voting_method: 'STAR',
                    candidates: [] as Candidate[],
                    precincts: undefined,
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
    const [titleError, setTitleError] = useState(false)
    
    console.log(election)
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
        }
        if (newElection.races.length===1) {
            // If only one race, use main eleciton title and description
            newElection.races[0].title = newElection.title
            newElection.races[0].description = newElection.description
        }

        try {
            onSubmitElection(newElection)
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
                    
                    <Settings election = {election} applyElectionUpdate = {applyElectionUpdate} getStyle = {getStyle} />
                    <Races election = {election} applyElectionUpdate = {applyElectionUpdate} getStyle = {getStyle} />
                    <Divider light />
                    <input 
                        type='submit' 
                        value={submitText} 
                        className='btn btn-block'
                        disabled = {disableSubmit} />
                </Grid>
            </Container>
        </form>
    )
}

export default ElectionForm 
