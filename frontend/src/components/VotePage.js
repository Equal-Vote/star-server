import { useEffect, useState } from "react"
import StarBallot from "./StarBallot";
import Button from "./Button";
import useFetch from "../useFetch";
import { useParams } from "react-router";
import React from 'react'
import { useHistory } from "react-router";

const VotePage = ({ }) => {
    const {id} = useParams();
    const {data: election, isPending, error} = useFetch(`/API/Election/${id}`)
    const [rankings, setRankings] = useState([])
    const history = useHistory();

    const onUpdate = (rankings) => {
        setRankings(rankings)
        console.log(rankings)}
    const submit = () => {
        console.log(election)
        console.log(election.Candidates)
        console.log(rankings)
        const message = {
            ElectionID: id,
            candidateScores: election.Candidates.map((candidate,i) => 
              ({'id': election.Candidates[i].id, 'score':rankings[i]})
            )
          }
          console.log(message)
          fetch(`/API/Election/${id}`,{
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
          }).then(
            history.push(`/ElectionResults/${id}`)
          )
    }
    return (
        <div>
            <>
            { error && <div> {error} </div>}
            { isPending && <div> Loading Election... </div>}
            {election && 
                <StarBallot
                race = {election.ElectionName}
                candidates = {election.Candidates}
                onUpdate = {onUpdate}
                defaultRankings = {Array(election.Candidates.length).fill(0)}
                readonly = {false}
            />}
            {election && <Button 
                text= 'Submit'
                onClick = {submit}
            />}

                </>
        </div>
    )
}

export default VotePage
