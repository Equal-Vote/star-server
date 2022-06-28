import React from 'react'
import ElectionForm from "./ElectionForm";
import Container from '@material-ui/core/Container';

const AddElection = ({ authSession }) => {
    const onAddElection = async (election, voterIds) => {
        // try {
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
        {!authSession.isLoggedIn() && <div> Must be logged in to create elections </div>}
        {authSession.isLoggedIn() && 
            <ElectionForm authSession={authSession} onSubmitElection={onAddElection} prevElectionData={null} submitText='Create Election'/> 
        }
        </Container>
    )
}

export default AddElection
