import Button from "./Button"
import { Link } from "react-router-dom"
import React from 'react'

const Election = ({ election }) => {

    return (
        <div className="card">
            <div className="card__cover">
                <h3>{election.title}</h3>
        
            </div>
            <div className="card__content">
                <Link to = {`/Election/${election.electionId}`}> <h1>Vote</h1> </Link>
                {/* {<Button color='steelblue' text='Vote' onClick={() => onVote(election.id)} />} */}
                <Link to = {`/ElectionResults/${election.electionId}`}> <h1>View Results</h1> </Link>
                {/* <Button color='steelblue' text='View Results' onClick={() => onViewResults(election.id)} /> */}
            </div>
    
</div>
        // <div className = 'election'>
        //     <h3>{election.ElectionName}</h3>
        
        //     </div>

    )
}

export default Election
