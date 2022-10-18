import React from 'react'
import useFetch from '../../hooks/useFetch';
import ElectionForm from "./ElectionForm";
import Container from '@material-ui/core/Container';
import { useNavigate } from "react-router"

const AddElection = ({ authSession }) => {

    const navigate = useNavigate()
    const { error, isPending, makeRequest: postElection } = useFetch('/API/Elections', 'post')
    const onAddElection = async (election) => {
        // calls post election api, throws error if response not ok
        const newElection = await postElection(
            {
                Election: election,
            })
        if ((!newElection)) {
            throw Error("Error submitting election");
        }
        
        navigate(`/Election/${newElection.election.election_id}`)
    }

    return (
        <Container >
            {!authSession.isLoggedIn() && <div> Must be logged in to create elections </div>}
            {authSession.isLoggedIn() &&
                <ElectionForm authSession={authSession} onSubmitElection={onAddElection} prevElectionData={null} submitText='Create Election' disableSubmit={isPending} />
            }
            {isPending && <div> Submitting... </div>}
            {error && <div> {error} </div>}
        </Container>
    )
}

export default AddElection
