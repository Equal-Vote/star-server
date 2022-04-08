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

    const onEditElection = async (election) => {
        // try {
        // const res = await fetch('/API/Elections', {
        //     method: 'POST',
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         Election: election,
        //         VoterIDList: voterIDList.split("\n"),
        //     })
        // })
        // if (!res.ok) {
        //     Error('Could not fetch data')
        // }
        // return res
        // console.log(res)
        // if (!res.ok) {
        //     throw Error('Could not fetch data')
        // }
        // console.log('Navigating')
        // } catch (error) {
        //     console.log(error)
        //     return
        // }
    }

    return (
        <Container >
        <>
        {error && <div> {error} </div>}
        {isPending && <div> Loading Election... </div>}
        {!authSession.isLoggedIn() && <div> Must be logged in to edit </div>}
        {authSession.isLoggedIn() && data && data.election && authSession.getIdField('sub') == data.election.owner_id &&
            <ElectionForm authSession={authSession} onSubmitElection={onEditElection} election={data.election}/>
        }
        </>
        </Container>
    )
}

export default EditElection 
