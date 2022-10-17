import { useState } from "react"
import BallotSelector from "./BallotSelector";
import useFetch from "../../../useFetch";
import { useParams } from "react-router";
import React from 'react'
import { useNavigate } from "react-router";
import { Ballot } from "../../../../../domain_model/Ballot";
import { Vote } from "../../../../../domain_model/Vote";
import { Score } from "../../../../../domain_model/Score";
import { Box, Container } from "@material-ui/core";
import Button from "@material-ui/core/Button";
const VotePage = ({ election, fetchElection }) => {
  const { id } = useParams();
  const [scores, setScores] = useState(election.races.map((race) =>
    Array(race.candidates.length).fill(null)))

  const navigate = useNavigate();
  const [currentRace, setCurrentRace] = useState(0)
  const { data, isPending, error, makeRequest: postBallot } = useFetch(`/API/Election/${id}/vote`, 'post')
  const onUpdate = (race_index, newRaceScores) => {
    var newRankings = [...scores]
    newRankings[race_index] = newRaceScores
    setScores(newRankings)
  }
  const submit = async () => {
    const votes: Vote[] =
      election.races.map((race, race_index) => (
        {
          race_id: '0',
          scores: election.races[race_index].candidates.map((candidate, i) =>
            ({ 'candidate_id': election.races[race_index].candidates[i].candidate_id, 'score': scores[race_index][i]===null ? 0 : scores[race_index][i] } as Score)
          )
        }))

    const ballot: Ballot = {
      ballot_id: '0', //Defaults to zero but is assigned ballot id by server when submitted
      election_id: election.election_id,
      votes: votes,
      date_submitted: Date.now(),
      status: 'submitted',
    }
    // post ballot, if response ok navigate back to election home
    if (!(await postBallot({ ballot: ballot }))) {
      return
    }
    await fetchElection() // refetch election to update voter auth
    navigate(`/Election/${id}`)
  }
  console.log(scores)
  return (
    <Container disableGutters={true} maxWidth="sm">
      <BallotSelector
        race={election.races[currentRace]}
        candidates={election.races[currentRace].candidates}
        onUpdate={newRankings => { onUpdate(currentRace, newRankings) }}
        scores={scores[currentRace]}
      />
      {election.races.length > 1 &&
        <Box sx={{ display: 'flex', justifyContent: "space-between" }}>
          <Button
            variant='outlined'
            onClick={() => setCurrentRace(count => count - 1)}
            disabled={currentRace === 0}
            style={{ minWidth:"150px" }}>
            Previous Race
          </Button>
          <Button
            variant='outlined'
            onClick={() => setCurrentRace(count => count + 1)}
            disabled={currentRace === election.races.length-1}
            style={{ minWidth:"150px" }}>
            Next Race
          </Button>
        </Box>
      }
      
      <Box sx={{ display: 'flex', justifyContent: "space-between" }}>
        <Button
          variant='outlined'
          onClick={submit}
          disabled={isPending||currentRace !== election.races.length-1 || scores[currentRace].every(score => score===null)}//disable unless on last page and at least one candidate scored
          style={{ marginLeft: "auto", minWidth:"150px" }}>
          Submit Ballot
        </Button>
      </Box>
      {<div> {error} </div>}
      {isPending && <div> Submitting... </div>}
    </Container>
  )
}

export default VotePage
