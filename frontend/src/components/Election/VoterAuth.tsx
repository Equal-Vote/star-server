import { useEffect, useState } from "react"
import { useParams } from "react-router";
import React from 'react'
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import TextField from "@mui/material/TextField";
import Box from '@mui/material/Box';
import { FormHelperText } from "@mui/material"
import { useCookie } from "../../hooks/useCookie";
import { Election } from '../../../../domain_model/Election';
import { VoterAuth as IVoterAuth } from '../../../../domain_model/VoterAuth';
import { IAuthSession } from '../../hooks/useAuthSession';

type Props = {
  authSession: IAuthSession,
  electionData: {
    election: Election, 
    voterAuth: IVoterAuth},
  fetchElection: Function,
}

const VoterAuth = ({ authSession, electionData, fetchElection }: Props) => {
  const { voter_id } = useParams();
  // TODO: maybe we should reconsider useCookie here? this has the potential of inserting the voter id on a different election
  const [voterID, setVoterID] = useCookie('voter_id', voter_id ? voter_id : null, 1)

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

  if (!electionData) return <></>

  const isOpen = electionData?.election?.state === "open"

  const voterIdRequired = electionData?.election?.settings?.voter_authentication?.voter_id
  const emailRequired = electionData?.election?.settings?.voter_authentication?.email

  const isAuthorized = electionData.voterAuth?.authorized_voter
  const missingEmail = electionData?.voterAuth?.required === "Email Validation Required"
  const missingVoterID = electionData.voterAuth?.required === "Voter ID Required"


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
          {voterIdRequired && voter_id === null &&
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
