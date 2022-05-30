import React from 'react'
import { useParams } from "react-router";
import useFetchSetData from "../useFetchSetData";
import Container from '@material-ui/core/Container';
import ElectionForm from "./ElectionForm";
import { useState } from "react";

const DuplicateElection = ({ authSession }) => {
    const { id } = useParams();
    let { data, setData, isPending, error } = useFetchSetData(`/API/Election/${id}`,{
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    })

    // TODO: This approach for adding copyOf feels messy, let me know if there's a better way
    if(data && data.election && !data.copyOfAdded){
        setData(oldData => {
            return {...oldData, copyOfAdded: true, election: {...oldData.election, title: `Copy of ${oldData.election.title}`}}
        })
    }

    const onCreateElection = async (election, voterIds) => {
        const res = await fetch('/API/Elections', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Election: election,
                VoterIDList: voterIds,
            })
        })
        if (!res.ok) {
            Error('Could not fetch data')
        }
        return res
    }

    return (
        <Container >
        {error && <div> {error} </div>}
        {isPending && <div> Loading Election... </div>}
        {!authSession.isLoggedIn() && <div> Must be logged in to create elections </div>}
        {authSession.isLoggedIn() && data && data.election &&
            <ElectionForm authSession={authSession} onSubmitElection={onCreateElection} prevElectionData={data.election} submitText='Create Election'/>
        }
        </Container>
    )
}

export default DuplicateElection 
