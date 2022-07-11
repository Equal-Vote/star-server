import React from 'react'
import { useParams } from "react-router";
import useFetch from "../useFetch";
import Container from '@material-ui/core/Container';
import ElectionForm from "./ElectionForm";

const EditElection = ({ authSession, election }) => {
    const { id } = useParams();
    const { isPending, error, makeRequest: editElection } = useFetch(`/API/Election/${election.election_id}/edit`,'post')
    const onEditElection = async (election, voterIds) => {
        if ((! await editElection(
            {
                Election: election,
                VoterIDList: voterIds,
            }))) {
            throw Error("Error editing election");
        }
    }

    return (
        <Container >
        <>
        {error && <div> {error} </div>}
        {isPending && <div> Submitting... </div>}
        {!authSession.isLoggedIn() && <div> Must be logged in to edit </div>}
        {authSession.isLoggedIn() && authSession.getIdField('sub') == election.owner_id &&
            <ElectionForm authSession={authSession} onSubmitElection={onEditElection} prevElectionData={election} submitText='Apply Updates'/>
        }
        </>
        </Container>
    )
}

export default EditElection 
