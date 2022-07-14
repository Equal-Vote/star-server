import { useEffect, useState } from "react"
import StarBallot from "./StarBallot";
import useFetch from "../useFetch";
import { useParams } from "react-router";
import React from 'react'
import { useNavigate } from "react-router";
import { Ballot } from "../../../domain_model/Ballot";
import { Vote } from "../../../domain_model/Vote";
import { Score } from "../../../domain_model/Score";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ProfilePic from '../images/blank-profile.png'
import { Link } from "react-router-dom"
import { createTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import TextField from "@material-ui/core/TextField";
import Box from '@material-ui/core/Box';
import { Tooltip } from "@material-ui/core";
const VoterAuth = ({ authSession, electionData, fetchElection }) => {
  const { id } = useParams();
  const [voterID, setVoterID] = useState('')

  const navigate = useNavigate();

  const submitVoterID = () => {
    authSession.setCookie('voter_id', voterID, 1)
    fetchElection()
  }

  return (
    <Container >
      <>
        {electionData && !electionData.voterAuth.authorized_voter && !electionData.voterAuth.required &&
          <Box border={2} sx={{ mt: 5, ml: 0, mr: 0, width: '100%' }}>
            <Grid container alignItems="center" justify="center" direction="column">
              <Typography align='center' gutterBottom variant="h4" component="h4">
                You are not authorized to vote in this election
              </Typography>
            </Grid>
          </Box>
        }
        {electionData && !electionData.voterAuth.authorized_voter && electionData.voterAuth.required && electionData.voterAuth.required === "Log In" &&
          <Box border={2} sx={{ mt: 5, ml: 0, mr: 0, width: '100%' }}>
            <Grid container alignItems="center" justify="center" direction="column">
              <Typography align='center' gutterBottom variant="h4" component="h4">
                You must log in to access this election
              </Typography>
            </Grid>
          </Box>
        }
        {electionData && !electionData.voterAuth.authorized_voter && electionData.voterAuth.required && electionData.voterAuth.required === "Voter ID" &&
          <Box border={2} sx={{ mt: 5, ml: 0, mr: 0, width: '100%' }}>
            <Grid container alignItems="center" justify="center" direction="column">
              <Typography align='center' gutterBottom variant="h4" component="h4">
                Enter Voter ID
              </Typography>

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

              <Button variant='outlined' onClick={() => submitVoterID()} > Submit </Button>
            </Grid>
          </Box>

        }
      </>
    </Container>
  )
}

export default VoterAuth
