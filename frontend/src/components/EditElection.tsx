import React from 'react'
import { useParams } from "react-router";
import useFetch from "../useFetch";
import Container from '@material-ui/core/Container';
import ElectionForm from "./ElectionForm";

const EditElection = ({ authSession }) => {
    const { id } = useParams();
    const { data, isPending, error } = useFetch(`/API/Election/${id}`,{
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    })

    console.log(data);

    const onEditElection = async (election, voterIds) => {
        const res = await fetch(`/API/Election/${election.election_id}/edit`, {
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
        <>
        {error && <div> {error} </div>}
        {isPending && <div> Loading Election... </div>}
        {!authSession.isLoggedIn() && <div> Must be logged in to edit </div>}
        {authSession.isLoggedIn() && data && data.election && authSession.getIdField('sub') == data.election.owner_id &&
            <ElectionForm authSession={authSession} onSubmitElection={onEditElection} prevElectionData={data.election} submitText='Apply Updates'/>
        }
        </>
        </Container>
    )
}

export default EditElection 
