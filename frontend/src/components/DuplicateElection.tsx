import React from 'react'
import { useParams } from "react-router";
import useFetch from "../useFetch";
import Container from '@material-ui/core/Container';
import ElectionForm from "./ElectionForm";
import { useState, useEffect } from "react";

const DuplicateElection = ({ authSession }) => {
    const { id } = useParams();

    const [data, setData] = useState(null);

    let { data: prevData, isPending, error } = useFetch(`/API/Election/${id}`,{
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    useEffect(
        () => {
            if(prevData && prevData.election){
                setData({...prevData, election: {...prevData.election, title: `Copy of ${prevData.election.title}`}});
            } 
        }, [prevData]
    )

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
