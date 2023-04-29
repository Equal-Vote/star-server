import { useState } from "react"
import BallotSelector from "./BallotSelector";
import useFetch from "../../../hooks/useFetch";
import { useParams } from "react-router";
import React from 'react'
import { useNavigate } from "react-router";
import { Ballot } from "../../../../../domain_model/Ballot";
import { Vote } from "../../../../../domain_model/Vote";
import { Score } from "../../../../../domain_model/Score";
import { Box, Container } from "@mui/material";
import Button from "@mui/material/Button";
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
          race_id: race.race_id,
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
    navigate(`/Election/${id}/thanks`)
  }
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
            style={{ minWidth:"150px", marginRight: "10%" }}>
            Previous Race
          </Button>
          {scores.map((scores, n) => (
            <>
            <Button
              variant='outlined'
              onClick={() => setCurrentRace(n)}
              style={{ minWidth:"20px", border: "none" }}>
              {(scores.some((s) => ( s > 0 )))? <>✅</> : <>⬜</>}
            </Button>
            </>
          ))}
          <Button
            variant='outlined'
            onClick={() => setCurrentRace(count => count + 1)}
            disabled={currentRace === election.races.length-1}
            style={{ minWidth:"150px", marginLeft: "10%" }}>
            Next Race
          </Button>
        </Box>
      }
      
      <Box sx={{ display: 'flex', justifyContent: "space-between" }}>
        <Button
          variant='outlined'
          onClick={submit}
          disabled={isPending||currentRace !== election.races.length-1 || scores[currentRace].every(score => score===null)}//disable unless on last page and at least one candidate scored
          style={{ marginLeft: "auto", minWidth:"150px", marginTop:"20px"}}>
          Submit Ballot
        </Button>
      </Box>
      {isPending && <div> Submitting... </div>}
    </Container>
  )
}

export default VotePage
