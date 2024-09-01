import React from 'react'
import ElectionForm from "./ElectionForm";
import { useNavigate } from "react-router"
import { Election } from '@equal-vote/star-vote-shared/domain_model/Election';
import { usePostElection } from '../../hooks/useAPI';
import useAuthSession from '../AuthSessionContextProvider';

const AddElection = () => {
    const authSession = useAuthSession()
    const navigate = useNavigate()
    const { error, isPending, makeRequest: postElection } = usePostElection()
    const onAddElection = async (election: Election) => {
        // calls post election api, throws error if response not ok
        const newElection = await postElection(
            {
                Election: election,
            })
        if ((!newElection)) {
            throw Error("Error submitting election");
        }
        localStorage.removeItem('Election')
        navigate(`/${newElection.election.election_id}/admin`)
    }

    return <></>
    return (
        < >
            {!authSession.isLoggedIn() && <div> Must be logged in to create elections </div>}
            {authSession.isLoggedIn() &&
                <ElectionForm authSession={authSession} onSubmitElection={onAddElection} prevElectionData={null} submitText='Save Draft' disableSubmit={isPending} />
            }
            {isPending && <div> Submitting... </div>}
        </>
    )
}

export default AddElection
