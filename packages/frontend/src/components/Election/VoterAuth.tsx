import { useEffect, useState } from "react"
import { useParams } from "react-router";
import React from 'react'
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import TextField from "@mui/material/TextField";
import Box from '@mui/material/Box';
import { FormHelperText } from "@mui/material"
import { useCookie } from "../../hooks/useCookie";
import useAuthSession from "../AuthSessionContextProvider";
import useElection from "../ElectionContextProvider";

const VoterAuth = () => {
  const authSession = useAuthSession()
  const { election, voterAuth, refreshElection, permissions, updateElection } = useElection()
  const { voter_id } = useParams();
  // TODO: maybe we should reconsider useCookie here? this has the potential of inserting the voter id on a different election
  const [voterID, setVoterID] = useCookie('voter_id', voter_id ? voter_id : null, 1)

  useEffect(() => {
    setVoterID(voter_id)
    submitVoterID()
  }, [voter_id])

  const submitVoterID = () => {
    refreshElection()
  }

  const clearVoterID = () => {
    setVoterID(null)
    refreshElection()
  }

  if (!election) return <></>

  const isOpen = election.state === "open"

  const voterIdRequired = election.settings?.voter_authentication?.voter_id
  const emailRequired = election.settings?.voter_authentication?.email

  const isAuthorized = voterAuth?.authorized_voter
  const missingEmail = voterAuth?.required === "Email Validation Required"
  const missingVoterID = voterAuth?.required === "Voter ID Required"

  return (
    <Box sx={{ p: 1, flexGrow: 1 }}>
      {isOpen &&
        <>
          {!isAuthorized && !missingEmail && emailRequired &&
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Typography align='center' variant="h5" component="h5">
                You are not authorized to vote in this election
              </Typography>
            </Box>
          }
          {!isAuthorized && missingEmail && emailRequired &&
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Typography align='center' gutterBottom variant="h5" component="h5">
                You must <a onClick={authSession.openLogin} style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>log in </a> to access this election
              </Typography>
            </Box>
          }
          {voterIdRequired && voter_id !== undefined && isAuthorized &&
            <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h5" component="h5">
                Your unique voter id:
              </Typography>
              <p>
                {/*The below expression displays the uuid as b1d0cac0-****-****-****-************ */}
                {voter_id.split('-').map((str, i) => (i==0)? str : str.replace(/./g, "●")).join('-')}
              </p>
            </Box>
          }
          {voterIdRequired && (voter_id === undefined || !isAuthorized) &&
            <>
              <Box sx={{ display: 'flex' }}>
                <Box sx={{ p: 1, flexGrow: 1 }}>
                  <TextField
                    id="voter-id"
                    name="voterid"
                    label="Voter ID"
                    value={voterID ? voterID : ''}
                    type="password"
                    fullWidth
                    onChange={(e) => {
                      setVoterID(e.target.value)
                    }}
                    error={(!missingVoterID && !isAuthorized)}
                  />
                </Box>

                {(!isAuthorized || missingVoterID) &&
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                    <Button variant='outlined' onClick={() => submitVoterID()} > Submit </Button>
                  </Box>
                }
                {isAuthorized && voterID &&
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                    <Button variant='outlined' onClick={() => clearVoterID()} > Clear </Button>
                  </Box>
                }
              </Box>
              <FormHelperText error sx={{ pl: 1, pt: 0 }}>
                {(!missingVoterID && !isAuthorized) ? "Invalid Voter ID" : ''}
              </FormHelperText>
            </>
          }
        </>
      }
    </Box>
  )
}

export default VoterAuth
