import React from 'react'
import ElectionForm from "./ElectionForm";

const AddElection = ({ authSession }) => {
    const onAddElection = async (election, voterIds) => {
        // try {
        console.log(election)
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

    return ( <ElectionForm authSession={authSession} onSubmitElection={onAddElection} prevElectionData={null} submitText='Create Election'/> );
}

export default AddElection
