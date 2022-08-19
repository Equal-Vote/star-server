import { useEffect, useState } from "react"
import StarBallot from "./StarBallot";
import Button from "./Button";
import useFetch from "../useFetch";
import { useParams } from "react-router";
import React from 'react'
import { useNavigate } from "react-router";
import { Ballot } from "../../../domain_model/Ballot";
import { Vote } from "../../../domain_model/Vote";
import { Score } from "../../../domain_model/Score";
import { Container } from "@material-ui/core";
const VotePage = ({ election }) => {
  const { id } = useParams();
  const [rankings, setRankings] = useState([])
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('')

  const { data, isPending, error, makeRequest: postBallot } = useFetch(`/API/Election/${id}/vote`, 'post')
  const onUpdate = (rankings) => {
    setRankings(rankings)
    console.log(rankings)
  }
  const submit = async () => {
    console.log(rankings)

    const votes: Vote[] = [{
      race_id: '0',
      scores: election.races[0].candidates.map((candidate, i) =>
        ({ 'candidate_id': election.races[0].candidates[i].candidate_id, 'score': rankings[i] } as Score)
      )
    }]

    const ballot: Ballot = {
      ballot_id: '0', //Defaults to zero but is assigned ballot id by server when submitted
      election_id: election.election_id,
      votes: votes,
      date_submitted: Date.now(),
      status: 'submitted',
    }
    console.log(ballot)
    // post ballot, if response ok navigate back to election home
    if (!(await postBallot({ ballot: ballot }))) {
      return
    }
    navigate(`/Election/${id}`)
  }
  return (
    <>
      <StarBallot
        race={election.races[0]}
        candidates={election.races[0].candidates}
        onUpdate={onUpdate}
        defaultRankings={Array(election.races[0].candidates.length).fill(0)}
        readonly={false}
        onSubmitBallot={submit}
      />
      {<div> {error} </div>}
    </>
  )
}

export default VotePage
