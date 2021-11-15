import Election from "./Election"
import Button from "./Button"
import useFetch from "../useFetch"
import { Link } from "react-router-dom"
import React from 'react'

const Elections = ({ onVote,onNewElection,onViewResults}) => {
    const {data: elections, isPending, error} = useFetch('/Elections')

    return (
        <>
            { error && <div> {error} </div>}
            { isPending && <div> Loading Elections... </div>}
            {/* { elections && <Button color='steelblue' text='New Election' onClick={onNewElection} />} */}
            { elections && <div><Link to='/CreateElection'> Create New Election</Link></div>}
            { elections && elections.map((election) => (
                <Election key = {election.id} election ={election}
                onVote = {onVote}
                onViewResults = {onViewResults}
                />
            ))}
        </>
    )
}

export default Elections
