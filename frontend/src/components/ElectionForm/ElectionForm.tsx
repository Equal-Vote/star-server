import { useState, useEffect, useRef } from "react"
import React from 'react'
import Grid from "@mui/material/Grid";
import structuredClone from '@ungap/structured-clone';
import Settings from "./Settings";
import Races from "./Races";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { Box, Paper } from "@mui/material";
import { Election } from "../../../../domain_model/Election";
import ElectionDetails from "./ElectionDetails";

const ElectionForm = ({ authSession, onSubmitElection, prevElectionData, submitText, disableSubmit }) => {
    // I'm referencing 4th option here
    // https://daveceddia.com/usestate-hook-examples/
    const defaultElection: Election = {
        title: '',
        election_id: '0',
        description: '',
        state: 'draft',
        frontend_url: '',
        owner_id: '',
        races: [
            {
                race_id: '0',
                title: '',
                description: '',
                num_winners: 1,
                voting_method: 'STAR',
                candidates: [
                    {
                        candidate_id: '0',
                        candidate_name: '',
                    },
                    {
                        candidate_id: '1',
                        candidate_name: '',
                    },
                    {
                        candidate_id: '2',
                        candidate_name: '',
                    }
                ],
                precincts: undefined,
            }
        ],
        settings: {
            voter_access: 'open',
            voter_authentication: {
                ip_address: true,
            },
            ballot_updates: false,
            public_results: true,
        }
    }
    if (prevElectionData == null) {
        prevElectionData = defaultElection
    }

    const [election, setElectionData] = useLocalStorage('Election', prevElectionData)
    useEffect(() => {
        prevElectionData.races.forEach((race) => {
            race.candidates.push({
                candidate_id: String(race.candidates.length),
                candidate_name: '',
            })
        })
        setElectionData(prevElectionData)
    }, [])

    const [pageNumber, setPageNumber] = useState(0)

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
        return { style: { fontWeight: (cur == prev) ? 'normal' : 'bold' } }
    }

    const onSubmit = () => {
        // This assigns only the new fields, but otherwise keeps the existing election fields

        const newElection = structuredClone(election)
        newElection.frontend_url = ''
        newElection.owner_id = authSession.getIdField('sub')
        newElection.state = 'draft'

        if (newElection.races.length === 1) {
            // If only one race, use main eleciton title and description
            newElection.races[0].title = newElection.title
            newElection.races[0].description = newElection.description
        }

        //Iterates through races and removes candidates without a name listed
        newElection.races.forEach((race, index) => {
            const newCandidates = []
            newElection.races[index].candidates.forEach(candidate => {
                if (candidate.candidate_name !== '') {
                    newCandidates.push(candidate)
                }
            });
            newElection.races[index].candidates = newCandidates
        })

        try {
            onSubmitElection(newElection)
        } catch (error) {
            console.log(error)
        }
    }



    return (
        <Box
            display='flex'
            justifyContent="center"
            alignItems="center"
            sx={{
                my: 2,
                mx: { xs: 0 },
                display: 'flex',
                flexWrap: 'wrap',
            }}>
            <Paper elevation={3} sx={{ maxWidth: 600 }} >
                <form id={'electionForm'} onSubmit={(e) => e.preventDefault()}>
                    <Grid container
                        sx={{
                            m: 0,
                            p: 1,
                        }}
                    >
                        {pageNumber === 0 &&
                            <ElectionDetails election={election} applyElectionUpdate={applyElectionUpdate} getStyle={getStyle} setPageNumber={setPageNumber} />
                        }

                        {pageNumber === 1 &&
                            <Settings election={election} applyElectionUpdate={applyElectionUpdate} getStyle={getStyle} setPageNumber={setPageNumber} />
                        }

                        {pageNumber === 2 &&
                            <Races election={election} applyElectionUpdate={applyElectionUpdate} getStyle={getStyle} submitText={submitText} onSubmit={onSubmit}/>
                        }
                    </Grid>
                </form>
            </Paper>
        </Box>
    )
}

export default ElectionForm 
