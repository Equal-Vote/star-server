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
import VoterAuth from "./VoterAuth";
import PermissionHandler from "../PermissionHandler";

const ElectionHome2 = ({ authSession, electionData, fetchElection }) => {
  const { id } = useParams();

  const { data, isPending, error, makeRequest: postData } = useFetch(`/API/Election/${id}/finalize`, 'post')
  const { makeRequest: publishResults } = useFetch(`/API/Election/${id}/setPublicResults`, 'post')
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
      {electionData && electionData.election && electionData.voterAuth &&
        <Box
          display='flex'
          justifyContent="center"
          alignItems="center"
          sx={{ width: '100%' }}>
          <Paper elevation={3} sx={{ width: 600 }} >

            <Box sx={{ m: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <ShareButton url={`${window.location.origin}/Election/${electionData.election.election_id}`} text={'Share'} />
            </Box>
            <Typography align='center' gutterBottom variant="h4" component="h4">
              {electionData.election.title}
            </Typography>

            <VoterAuth authSession={authSession} electionData={electionData} fetchElection={fetchElection} />
            <Typography align='center' gutterBottom component="p" style={{ whiteSpace: 'pre-line' }}>
              {electionData.election.description}
            </Typography>
            {electionData.election.state === 'draft' &&
              <Box sx={{ m: 1, display: 'flex', justifyContent: 'center' }}>
                <Button variant='outlined' href={`/Election/${String(electionData.election.election_id)}/vote`} >
                  Preview Ballot
                </Button>
                <Tooltip title="Opens election for ballots to be submitted and prevents future edits" >
                  <Button variant='outlined' onClick={() => finalizeElection()} >
                    Finalize
                  </Button>
                </Tooltip>
              </Box>
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

                <Box sx={{ m: 1, display: 'flex', justifyContent: 'center' }}>
                  <Button variant='outlined' href={`/Election/${String(electionData?.election?.election_id)}/vote`} >
                    Vote
                  </Button>
                </Box>
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
            {(electionData.election.state === 'open' || electionData.election.state === 'closed') && electionData.election.settings.public_results === true &&
              <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                <Button variant='outlined' href={`/Election/${electionData.election.election_id}/results`} >
                  View Results
                </Button>
              </Box>
            }
            {(electionData.election.state === 'open' || electionData.election.state === 'closed') && electionData.election.settings.public_results === false &&
              <PermissionHandler permissions={electionData.voterAuth.permissions} requiredPermission={'canViewPreliminaryResults'}>
                <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                  <Button variant='outlined' href={`/Election/${electionData.election.election_id}/results`} >
                    View Preliminary Results
                  </Button>
                </Box>
              </PermissionHandler>
            }
            { electionData.election.pubic_results === false &&
              <PermissionHandler permissions={electionData.voterAuth.permissions} requiredPermission={'canEditElectionState'}>
                <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                <Button variant='outlined' 
                  onClick={async () => {
                    await publishResults({public_results: true})
                    fetchElection()
                  }}>
                  Make Results Public
                </Button>
              </Box>
            </PermissionHandler>
            }

            <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
              {authSession.isLoggedIn() &&
                <Tooltip title="Create copy of this election" >
                  <IconButton component={Link} to={`/DuplicateElection/${electionData.election.election_id}`}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              }
            </Box>

          </Paper>
        </Box>
      }
    </>
  )
}

export default ElectionHome2
