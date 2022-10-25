import useFetch from "../../hooks/useFetch";
import { useParams } from "react-router";
import React from 'react'
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Link } from "react-router-dom"
import Box from '@mui/material/Box';
import { IconButton, Paper, Tooltip } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareButton from "./ShareButton";

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
    }
    if (new Date(electionData.election.start_time).getTime() < currentTime.getTime()) {
      return true
    }
    return false

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
    <>
      {error && <div> {error} </div>}
      {electionData && (electionData.voterAuth.authorized_voter || electionData.voterAuth.roles.length > 0) && electionData.election &&
        <Box
          display='flex'
          justifyContent="center"
          alignItems="center"
          sx={{ width: '100%' }}>
          <Paper elevation={3} sx={{ width: 600 }} >

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ShareButton />
            </div>
            <Typography align='center' gutterBottom variant="h4" component="h4">
              {electionData.election.title}
            </Typography>
            <Typography align='center' gutterBottom component="p">
              {electionData.election.description}
            </Typography>
            {electionData.election.state === 'draft' &&
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant='outlined' href={`/Election/${String(electionData.election.election_id)}/vote`} >
                  Preview Ballot
                </Button>
                <Tooltip title="Opens election for ballots to be submitted and prevents future edits" >
                  <Button variant='outlined' onClick={() => finalizeElection()} >
                    Finalize
                  </Button>
                </Tooltip>
              </div>
            }

            {electionData.election.state === 'finalized' && electionData.election.start_time &&
              <Typography align='center' gutterBottom variant="h6" component="h6">
                {`Election begins on ${new Date(electionData.election.start_time).toLocaleDateString()} at ${new Date(electionData.election.start_time).toLocaleTimeString()} `}
              </Typography>
            }

            {electionData.election.state === 'open' && <>

              {electionData.election.end_time &&
                < Typography align='center' gutterBottom variant="h6" component="h6">
                  {`Election ends on ${new Date(electionData.election.end_time).toLocaleDateString()} at ${new Date(electionData.election.end_time).toLocaleTimeString()} `}
                </Typography>}
              {
                electionData.voterAuth.has_voted == false && electionData.voterAuth.authorized_voter && !electionData.voterAuth.required &&

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button variant='outlined' href={`/Election/${String(electionData?.election?.election_id)}/vote`} >
                    Vote
                  </Button>
                </div>
              }
            </>}

            {electionData.election.state === 'closed' &&
              <Typography align='center' gutterBottom variant="h6" component="h6">
                {`Election ended on ${new Date(electionData.election.end_time).toLocaleDateString()} at ${new Date(electionData.election.end_time).toLocaleTimeString()} `}
              </Typography>
            }



            {electionData.voterAuth.has_voted == true &&
              <Typography align='center' gutterBottom variant="h6" component="h6">
                Ballot Submitted
              </Typography>
            }
            {(electionData.election.state === 'open' || electionData.election.state === 'closed') &&
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant='outlined' href={`/Election/${electionData.election.election_id}/results`} >
                  View Results
                </Button>
              </div>
            }

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {authSession.isLoggedIn() &&
                <Tooltip title="Create copy of this election" >
                  <IconButton component={Link} to={`/DuplicateElection/${electionData.election.election_id}`}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              }
            </div>

          </Paper>
        </Box>
      }
    </>
  )
}

export default ElectionHome2
