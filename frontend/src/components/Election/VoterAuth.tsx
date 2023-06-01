import { useEffect, useState } from "react"
import { useParams } from "react-router";
import React from 'react'
import { useNavigate } from "react-router";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import TextField from "@mui/material/TextField";
import Box from '@mui/material/Box';
import { useCookie } from "../../hooks/useCookie";
const VoterAuth = ({ authSession, electionData, fetchElection }) => {
  const { voter_id } = useParams();
  const [voterID, setVoterID] = useCookie('voter_id', voter_id, 1)

  useEffect(() => {
    setVoterID(voter_id)
    submitVoterID()
  }, [voter_id])

  const submitVoterID = () => {
    fetchElection()
  }

  const clearVoterID = () => {
    setVoterID(null)
    fetchElection()
  }

  return (
    <Container >
      <>
        {electionData && electionData.election.state === "open" && !electionData.voterAuth.authorized_voter && !electionData.voterAuth.required &&
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography align='center' gutterBottom variant="h5" component="h5">
              You are not authorized to vote in this election
            </Typography>
          </Box>
        }
        {electionData && !electionData.voterAuth.authorized_voter && electionData.voterAuth.required && electionData.voterAuth.required === "Email Validation Required" &&
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography align='center' gutterBottom variant="h5" component="h5">
              You must log in to access this election
            </Typography>
          </Box>
        }
        {electionData && !electionData.voterAuth.authorized_voter && electionData.voterAuth.required && electionData.voterAuth.required === "Voter ID Required" &&
          <>
            <Box sx={{ p:1, display: 'flex', justifyContent: 'center' }}>
              <TextField
                id="voter-id"
                name="voterid"
                label="Voter ID"
                type="text"
                value={voterID}
                onChange={(e) => {
                  setVoterID(e.target.value)
                }}
              />
            </Box>
            <Box sx={{ p:1, display: 'flex', justifyContent: 'center' }}>
              <Button variant='outlined' onClick={() => submitVoterID()} > Submit </Button>
            </Box>
          </>
        }
        {electionData?.election?.settings?.voter_authentication?.voter_id && !electionData.voterAuth.required&& voterID &&
          <Box sx={{ p:1, display: 'flex', justifyContent: 'center' }}>
            <Button variant='outlined' onClick={() => clearVoterID()} > Clear Voter ID </Button>
          </Box>
        }
      </>
    </Container >
  )
}

export default VoterAuth
