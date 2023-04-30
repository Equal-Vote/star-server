import { useState } from "react"
import BallotPageSelector from "./BallotPageSelector";
import Grid from "@mui/material/Grid";
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
  const makePages = () => {
    // generate ballot pages
    let pages = election.races.map((race, i) => ({
      type: "ballot",
      scores: Array(race.candidates.length).fill(null),
      voting_method : race.voting_method,
      race_index: i
    }))

    // determine where to add info pages
    for(var i = 0; i < pages.length; i++){
      if(pages[i].type != "ballot") continue;

      // check if page is the first race with the voting method
      var info_exists = pages.some((p) => p.type == 'info' && p.voting_method == pages[i].voting_method);
      if(info_exists) continue;
      
      // add info page for method
      pages.splice(i, 0, {
        type: "info",
        voting_method: pages[i].voting_method
      })
    }

    return pages
  }
  const { id } = useParams();
  const [pages, setPages] = useState(makePages())
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0)
  const { data, isPending, error, makeRequest: postBallot } = useFetch(`/API/Election/${id}/vote`, 'post')
  const onUpdate = (pageIndex, newRaceScores) => {
    var newPages = [...pages]
    newPages[pageIndex].scores = newRaceScores
    setPages(newPages)
  }
  const submit = async () => {
    var scores = pages.filter((p) => p.type == "ballot").map((p) => p.scores)

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
      <BallotPageSelector
        page={pages[currentPage]}
        races={election.races}
        onUpdate={newRankings => { onUpdate(currentPage, newRankings) }}
      />
      {pages.length > 1 &&
        <Box sx={{ display: 'flex', justifyContent: "space-between" }}>
          <Button
            variant='outlined'
            onClick={() => setCurrentPage(count => count - 1)}
            disabled={currentPage === 0}
            style={{ minWidth:"150px", marginRight: "40px"}}>
            Previous Page
          </Button>
          <Grid xs={pages.length} wrap='nowrap'>
            {pages.map((page, n) => (
              <>
                <Button
                  onClick={() => setCurrentPage(n)}
                  style={{ fontSize: "16px", width: "auto", minWidth: "0px", marginTop: "10px", paddingLeft: "0px", paddingRight: "0px", outline: (n === currentPage)? 'solid' : 'none' }}
                >
                  {page.type == 'info' && <>📄</> }
                  {page.type == 'ballot' && (page.scores.some((s) => ( s > 0 ))? <>✅</> : <>⬜</>)}
                </Button>
              </>
            ))}
          </Grid>
          <Button
            variant='outlined'
            onClick={() => setCurrentPage(count => count + 1)}
            disabled={currentPage === pages.length-1}
            style={{ minWidth:"150px", marginLeft: "40px"}}>
            Next Page
          </Button>
        </Box>
      }
      
      <Box sx={{ display: 'flex', justifyContent: "space-between" }}>
        <Button
          variant='outlined'
          onClick={submit}
          disabled={isPending || currentPage !== pages.length-1 || pages[currentPage].scores.every(score => score===null)}//disable unless on last page and at least one candidate scored
          style={{ marginLeft: "auto", minWidth:"150px", marginTop:"20px"}}>
          Submit Ballot
        </Button>
      </Box>
      {isPending && <div> Submitting... </div>}
    </Container>
  )
}

export default VotePage
