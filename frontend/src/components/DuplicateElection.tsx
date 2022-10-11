import React from 'react'
import { useParams } from "react-router";
import useFetch from "../useFetch";
import Container from '@material-ui/core/Container';
import ElectionForm from "./ElectionForm";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router"

const DuplicateElection = ({ authSession }) => {
    const navigate = useNavigate()
    const { id } = useParams();

    const [data, setData] = useState(null);

    let { data: prevData, isPending, error, makeRequest: fetchElection } = useFetch(`/API/Election/${id}`, 'get');
    const { isPending: postIsPending, error: postError, makeRequest: postElection } = useFetch('/API/Elections', 'post')
    useEffect(() => {
        fetchElection()
    }, [])
    
    useEffect(
        () => {
            if (prevData && prevData.election) {
                setData({ ...prevData, election: { ...prevData.election, title: `Copy of ${prevData.election.title}` } });
            }
        }, [prevData]
    )

    const onCreateElection = async (election, voterIds) => {
        // calls post election api, throws error if response not ok
        const newElection = await postElection(
            {
                Election: election,
                VoterIDList: voterIds,
            })
        if ((!newElection)) {
            throw Error("Error submitting election");
        }
        
        navigate(`/Election/${newElection.election.election_id}`)
    }

    return (
        <Container >
            {error && <div> {error} </div>}
            {isPending && <div> Loading Election... </div>}
            {!authSession.isLoggedIn() && <div> Must be logged in to create elections </div>}
            {authSession.isLoggedIn() && data && data.election &&
                <ElectionForm authSession={authSession} onSubmitElection={onCreateElection} prevElectionData={data.election} submitText='Create Election' disableSubmit={postIsPending}/>
            }
            {postIsPending && <div> Submitting... </div>}
            {postError && <div> {postError} </div>}
        </Container>
    )
}

export default DuplicateElection 
