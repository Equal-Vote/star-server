import Button from "./Button"
import { Link } from "react-router-dom"
import React from 'react'

const Election = ({election}) => {

    return (
        <div>
        <div className = 'header'>
            <h3>{election.ElectionName}</h3>
        </div>
        <div className = 'header'>
            <Link to = {`/Election/${election.id}`}> <h1>Vote</h1> </Link>
            {/* {<Button color='steelblue' text='Vote' onClick={() => onVote(election.id)} />} */}
            <Link to = {`/ElectionResults/${election.id}`}> <h1>View Results</h1> </Link>
            {/* <Button color='steelblue' text='View Results' onClick={() => onViewResults(election.id)} /> */}
            </div>
        </div>
    )
}

export default Election
