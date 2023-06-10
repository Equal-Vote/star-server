import { useState } from "react"
import BallotPageSelector from "./BallotPageSelector";
import Grid from "@mui/material/Grid";
import useFetch from "../../../hooks/useFetch";
import { useParams } from "react-router";
import React from 'react'
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import { useNavigate } from "react-router";
import { Ballot } from "../../../../../domain_model/Ballot";
import { Vote } from "../../../../../domain_model/Vote";
import { Score } from "../../../../../domain_model/Score";
import { Box, Container, Step, StepLabel, Stepper, SvgIcon } from "@mui/material";
import Button from "@mui/material/Button";

// I'm using the icon codes instead of an import because there was padding I couldn't get rid of https://stackoverflow.com/questions/65721218/remove-material-ui-icon-margin
const INFO_ICON = "M 11 7 h 2 v 2 h -2 Z m 0 4 h 2 v 6 h -2 Z m 1 -9 C 6.48 2 2 6.48 2 12 s 4.48 10 10 10 s 10 -4.48 10 -10 S 17.52 2 12 2 Z m 0 18 c -4.41 0 -8 -3.59 -8 -8 s 3.59 -8 8 -8 s 8 3.59 8 8 s -3.59 8 -8 8 Z"
const CHECKED_BOX = "M 19 3 H 5 c -1.11 0 -2 0.9 -2 2 v 14 c 0 1.1 0.89 2 2 2 h 14 c 1.11 0 2 -0.9 2 -2 V 5 c 0 -1.1 -0.89 -2 -2 -2 Z m -9 14 l -5 -5 l 1.41 -1.41 L 10 14.17 l 7.59 -7.59 L 19 8 l -9 9 Z"
const UNCHECKED_BOX = "M 19 5 v 14 H 5 V 5 h 14 m 0 -2 H 5 c -1.1 0 -2 0.9 -2 2 v 14 c 0 1.1 0.9 2 2 2 h 14 c 1.1 0 2 -0.9 2 -2 V 5 c 0 -1.1 -0.9 -2 -2 -2 Z"

function shuffle(array) {
  // From: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  // Suffles and array into a random order
  let currentIndex = array.length,  randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

const VotePage = ({ election, fetchElection }) => {
  const makePages = () => {
    // generate ballot pages
    let pages = election.races.map((race, i) => ({
      type: "ballot",
      candidates: shuffle(race.candidates.map(c=> ({...c, score: null}))),
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
    newPages[pageIndex].candidates.forEach((c,i) => c.score = newRaceScores[i])
    // newPages[pageIndex].scores = newRaceScores
    setPages(newPages)
  }
  const submit = async () => {
    var candidateScores = pages.filter((p) => p.type == "ballot").map((p) => p.candidates)
    const sortFunc = (a: Score, b: Score) => {
      return Number(a.candidate_id) - Number(b.candidate_id);
    }
    const votes: Vote[] =
      election.races.map((race, race_index) => (
        {
          race_id: race.race_id,
          scores: candidateScores[race_index].map(c => ({candidate_id: c.candidate_id, score: c.score} as Score)).sort(sortFunc)
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
          <Stepper>
            {pages.map((page, n) => (
              <>
                <Step
                  onClick={() => setCurrentPage(n)}
                  style={{ fontSize: "16px", width: "auto", minWidth: "0px", marginTop: "10px", paddingLeft: "0px", paddingRight: "0px"}}
                >
                  <StepLabel>
                    {/*TODO: I can probably do this in css using the :selected property*/}
                    <SvgIcon style={{color: (n === currentPage)? 'var(--brand-black)' : 'var(--ballot-race-icon-teal)'}}>
                      {page.type == 'info' && <path d={INFO_ICON}/>}
                      {page.type == 'ballot' && (page.candidates.some((c) => ( c.score > 0 ))? <path d={CHECKED_BOX}/> : <path d={UNCHECKED_BOX}/> )}
                    </SvgIcon>
                  </StepLabel> 
                </Step>
              </>
            ))}
          </Stepper> 
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
          disabled={isPending || currentPage !== pages.length-1 || pages[currentPage].candidates.every(candidate => candidate.score===null)}//disable unless on last page and at least one candidate scored
          style={{ marginLeft: "auto", minWidth:"150px", marginTop:"20px"}}>
          Submit Ballot
        </Button>
      </Box>
      {isPending && <div> Submitting... </div>}
    </Container>
  )
}

export default VotePage
