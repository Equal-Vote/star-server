import React from 'react'
import { useParams } from "react-router";
import useFetch from "../../hooks/useFetch";
import Container from '@mui/material/Container';
import ElectionForm from "./ElectionForm";
import { useNavigate } from "react-router"

const EditElection = ({ authSession, election }) => {
    const navigate = useNavigate()
    const { id } = useParams();
    const { isPending, error, makeRequest: editElection } = useFetch(`/API/Election/${election.election_id}/edit`,'post')
    const onEditElection = async (election) => {
        const newElection = await editElection(
            {
                Election: election,
            })

        if ((!newElection )) {
            throw Error("Error editing election");
        }
        
        localStorage.removeItem('Election')
        navigate(`/Election/${election.election_id}`)
    }

    return (
        <Container >
        <>
        {!authSession.isLoggedIn() && <div> Must be logged in to edit </div>}
        {authSession.isLoggedIn() && authSession.getIdField('sub') == election.owner_id &&
            <ElectionForm authSession={authSession} onSubmitElection={onEditElection} prevElectionData={election} submitText='Apply Updates' disableSubmit={isPending}/>
        }
        {error && <div> {error} </div>}
        {isPending && <div> Submitting... </div>}
        </>
        </Container>
    )
}

export default EditElection 
