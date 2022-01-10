import Button from "./Button"
import { Link } from "react-router-dom"
import React from 'react'
import { Election } from "../../../domain_model/Election"

type ElectionCardProps = {
    election: Election
}

const ElectionCard = ({ election }: ElectionCardProps) => {

    return (
        <div className="card">
            <div className="card__cover">
                <h1>{election.title}</h1>
            </div>
            <div className="card__content">
                <Link to = {`/Election/${election.electionId}`}> <h1>Vote</h1> </Link>
                <Link to = {`/ElectionResults/${election.electionId}`}> <h1>View Results</h1> </Link>
            </div>
</div>
    )
}

export default ElectionCard
