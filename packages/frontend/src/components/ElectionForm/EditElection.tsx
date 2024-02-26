import React from 'react'
import { useParams } from "react-router";
import Container from '@mui/material/Container';
import ElectionForm from "./ElectionForm";
import { useNavigate } from "react-router"
import { useEditElection } from '../../hooks/useAPI';
import useAuthSession from '../AuthSessionContextProvider';
import useElection from '../ElectionContextProvider';

const EditElection = () => {
    const authSession = useAuthSession()
    
    const { election, refreshElection } = useElection()
    const navigate = useNavigate()
    const { isPending, error, makeRequest: editElection } = useEditElection(election.election_id)
    const onEditElection = async (election) => {
        const newElection = await editElection(
            {
                Election: election,
            })

        if ((!newElection )) {
            throw Error("Error editing election");
        }
        
        localStorage.removeItem('Election')
        refreshElection()
        navigate(`/${election.election_id}/admin`)
    }

    return (
        <Container >
        <>
        {!authSession.isLoggedIn() && <div> Must be logged in to edit </div>}
        {authSession.isLoggedIn() && authSession.getIdField('sub') == election.owner_id &&
            <ElectionForm authSession={authSession} onSubmitElection={onEditElection} prevElectionData={election} submitText='Apply Updates' disableSubmit={isPending}/>
        }
        {isPending && <div> Submitting... </div>}
        </>
        </Container>
    )
}

export default EditElection 
