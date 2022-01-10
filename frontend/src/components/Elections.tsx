import ElectionCard from "./ElectionCard"
import Button from "./Button"
import useFetch from "../useFetch"
import { Link } from "react-router-dom"
import React from 'react'
import { Election } from "../../../domain_model/Election"

const Elections = () => {
    const {data, isPending, error} = useFetch('/API/Elections')
    let elections = data as Election[];
    return (
        <>
            { error && <div> {error} </div>}
            { isPending && <div> Loading Elections... </div>}
            {/* { elections && <Button color='steelblue' text='New Election' onClick={onNewElection} />} */}
            { elections && <div><Link to='/CreateElection'> Create New Election</Link></div>}
            { elections && elections.map((election) => (
                <ElectionCard key = {election.electionId} election ={election}
                />
            ))}
        </>
    )
}

export default Elections
