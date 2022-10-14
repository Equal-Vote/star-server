import useFetch from "../useFetch";
import { useParams } from "react-router";
import React from 'react'
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { Link } from "react-router-dom"
import Box from '@material-ui/core/Box';
import { Tooltip } from "@material-ui/core";
const ElectionHome2 = ({ authSession, electionData, fetchElection }) => {
  const { id } = useParams();

  const { data, isPending, error, makeRequest: postData } = useFetch(`/API/Election/${id}/finalize`, 'post')
  const finalizeElection = async () => {
    console.log("finalizing election")
    try {
      await postData()
      await fetchElection()
    } catch (err) {
      console.log(err)
    }
  }

  const electionStarted = () => {
    const currentTime = new Date()
    if (!electionData.election.start_time) {
      return true
    } else if (new Date(electionData.election.start_time).getTime() < currentTime.getTime()) {
      return true
    } else {
      return false
    }
  }
  const electionEnded = () => {
    const currentTime = new Date()
    if (!electionData.election.end_time) {
      return false
    } else if (new Date(electionData.election.end_time).getTime() < currentTime.getTime()) {
      return true
    } else {
      return false
    }
  }

  return (
    <Container >
      <>
        {error && <div> {error} </div>}
        {electionData && (electionData.voterAuth.authorized_voter || electionData.voterAuth.roles.length>0) && electionData.election &&
          <Box border={2} sx={{ mt: 5, ml: 0, mr: 0, width: '100%' }}>
            <Grid container alignItems="center" justify="center" direction="column">
              <Typography align='center' gutterBottom variant="h4" component="h4">
                {electionData.election.title}
              </Typography>
              <Typography align='left' gutterBottom component="p">
                {electionData.election.description}
              </Typography>
              {electionData.election.start_time && !electionStarted() &&
                <Typography align='center' gutterBottom variant="h6" component="h6">
                  {`Election begins on ${new Date(electionData.election.start_time).toLocaleDateString()} at ${new Date(electionData.election.start_time).toLocaleTimeString()} `}
                </Typography>
              }
              {electionData.election.end_time && electionEnded() &&
                <Typography align='center' gutterBottom variant="h6" component="h6">
                  {`Election ended on ${new Date(electionData.election.end_time).toLocaleDateString()} at ${new Date(electionData.election.end_time).toLocaleTimeString()} `}
                </Typography>
              }

              {electionData.voterAuth.has_voted == false && electionStarted() && !electionEnded() &&
                <>
                  {electionData.election.end_time &&
                    <Typography align='center' gutterBottom variant="h6" component="h6">
                      {`Election ends on ${new Date(electionData.election.end_time).toLocaleDateString()} at ${new Date(electionData.election.end_time).toLocaleTimeString()} `}
                    </Typography>}
                  <Link to={`/Election/${String(electionData.election.election_id)}/vote`}>
                    <Typography align='center' gutterBottom variant="h6" component="h6">
                      Vote
                    </Typography>
                  </Link>
                </>}

              {electionData.voterAuth.has_voted == true &&
                <Typography align='center' gutterBottom variant="h6" component="h6">
                  Ballot Submitted
                </Typography>}
              <Link to={`/Election/${electionData.election.election_id}/results`}>
                <Typography align='center' gutterBottom variant="h6" component="h6">
                  View Results
                </Typography>
              </Link>
              {authSession.isLoggedIn() &&
              <Link to={`/DuplicateElection/${electionData.election.election_id}`}>
                <Typography align='center' gutterBottom variant="h6" component="h6">
                  Duplicate
                </Typography>
              </Link>}

              {electionData.election.state === 'draft' &&
                <>
                  <Tooltip title="Opens election for ballots to be submitted and prevents future edits" >
                    <Button variant='outlined' onClick={() => finalizeElection()} > Finalize </Button>
                  </Tooltip>
                </>
              }
            </Grid>
          </Box>
        }
      </>
    </Container>
  )
}

export default ElectionHome2
