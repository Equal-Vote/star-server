import { useEffect, useState } from "react"
import StarBallot from "./StarBallot";
import useFetch from "../useFetch";
import { useParams } from "react-router";
import React from 'react'
import { useNavigate } from "react-router";
import { Ballot } from "../../../domain_model/Ballot";
import { Vote } from "../../../domain_model/Vote";
import { Score } from "../../../domain_model/Score";
import { Container } from "@material-ui/core";
import Button from "@material-ui/core/Button";
const VotePage = ({ election, fetchElection}) => {
  const { id } = useParams();
  const [rankings, setRankings] = useState([])
  const navigate = useNavigate();

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
    await fetchElection() // refetch election to update voter auth
    navigate(`/Election/${id}`)
  }
  return (
    <Container disableGutters={true} maxWidth="sm">
      <StarBallot
        race={election.races[0]}
        candidates={election.races[0].candidates}
        onUpdate={onUpdate}
        defaultRankings={Array(election.races[0].candidates.length).fill(0)}
      />

      <Button
        variant='outlined'
        onClick={submit}
        disabled={isPending}>
        Submit Ballot
      </Button>
      {<div> {error} </div>}
      {isPending && <div> Submitting... </div>}
    </Container>
  )
}

export default VotePage
