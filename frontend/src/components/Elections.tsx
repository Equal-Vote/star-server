import Election from "./Election"
import Button from "./Button"
import useFetch from "../useFetch"
import { Link } from "react-router-dom"
import React from 'react'

const Elections = () => {
    const {data: elections, isPending, error} = useFetch('/API/Elections')

    return (
        <>
            { error && <div> {error} </div>}
            { isPending && <div> Loading Elections... </div>}
            {/* { elections && <Button color='steelblue' text='New Election' onClick={onNewElection} />} */}
            { elections && <div><Link to='/CreateElection'> Create New Election</Link></div>}
            { elections && elections.map((election) => (
                <Election key = {election.electionId} election ={election}
                />
            ))}
        </>
    )
}

export default Elections
