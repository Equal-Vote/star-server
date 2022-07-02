import React from 'react'
import useFetch from '../useFetch';
import ElectionForm from "./ElectionForm";

const AddElection = ({ authSession }) => {

    const { makeRequest: postElection } = useFetch('/API/Elections', 'post')
    const onAddElection = async (election, voterIds) => {
        // calls post election api, throws error if response not ok
        if ((! await postElection(
            {
                Election: election,
                VoterIDList: voterIds,
            }))) {
            throw Error("Error submitting election");
        }
    }

    return (<ElectionForm authSession={authSession} onSubmitElection={onAddElection} prevElectionData={null} submitText='Create Election' />);
}

export default AddElection
