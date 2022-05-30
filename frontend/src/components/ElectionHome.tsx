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
const ElectionHome = ({ authSession }) => {
  const { id } = useParams();
  const [isPending, setIsPending] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [voterID, setVoterID] = useState('')

  useEffect(() => {
    fetchElection()
  }, [])

  const [rankings, setRankings] = useState([])
  const navigate = useNavigate();
  console.log(data)
  const onUpdate = (rankings) => {
    setRankings(rankings)
    console.log(rankings)
  }

  const fetchElection = () => {
    const url = `/API/Election/${id}/ballot`;
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    }
    fetch(url, options)
      .then(res => {
        if (!res.ok) {
          setError('Error submitting ballot')
          throw Error('Could not fetch data')
        }
        return res.json();
      })
      .then(data => {
        setData(data);
        setIsPending(false);
        setError(null);
      })
      .catch(err => {
        setIsPending(false);
        setError(err.message);
      })
  }
  const finalizeElection = () => {
    const url = `/API/Election/${id}/finalize`;
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
    fetch(url, options)
      .then(res => {
        if (!res.ok) {
          setError('Error submitting ballot')
          throw Error('Could not fetch data')
        }
        return res.json();
      })
      .then((data) =>
        fetchElection()
      )
  }

  const submitVoterID = () => {
    authSession.setCookie('voter_id', voterID, 1)
    fetchElection()
  }

  const electionStarted = () => {
    const currentTime = new Date()
    if (!data.election.start_time) {
      return true
    } else if (new Date(data.election.start_time).getTime() < currentTime.getTime()) {
      return true
    } else {
      return false
    }
  }
  const electionEnded = () => {
    const currentTime = new Date()
    if (!data.election.end_time) {
      return false
    } else if (new Date(data.election.end_time).getTime() < currentTime.getTime()) {
      return true
    } else {
      return false
    }
  }

  return (
    <Container >
      <>
        {error && <div> {error} </div>}
        {isPending && <div> Loading Election... </div>}

        {data && data.voterAuth.authorized_voter && data.election &&
          <Box border={2} sx={{ mt: 5, ml: 0, mr: 0, width: '100%' }}>
            <Grid container alignItems="center" justify="center" direction="column">
              <Typography align='center' gutterBottom variant="h4" component="h4">
                {data.election.title}
              </Typography>
              <Typography align='left' gutterBottom component="p">
                {data.election.description}
              </Typography>
              {data.election.start_time && !electionStarted() &&
                <Typography align='center' gutterBottom variant="h6" component="h6">
                  {`Election begins on ${new Date(data.election.start_time).toLocaleDateString()} at ${new Date(data.election.start_time).toLocaleTimeString()} `}
                </Typography>
              }
              {data.election.end_time && electionEnded() &&
                <Typography align='center' gutterBottom variant="h6" component="h6">
                  {`Election ended on ${new Date(data.election.end_time).toLocaleDateString()} at ${new Date(data.election.end_time).toLocaleTimeString()} `}
                </Typography>
              }

              {data.voterAuth.has_voted == false && electionStarted() && !electionEnded() &&
                <>
                  {data.election.end_time &&
                    <Typography align='center' gutterBottom variant="h6" component="h6">
                      {`Election ends on ${new Date(data.election.end_time).toLocaleDateString()} at ${new Date(data.election.end_time).toLocaleTimeString()} `}
                    </Typography>}
                  <Link to={`/Election/${String(data.election.election_id)}/vote`}>
                    <Typography align='center' gutterBottom variant="h6" component="h6">
                      Vote
                    </Typography>
                  </Link>
                </>}

              {data.voterAuth.has_voted == true &&
                <Typography align='center' gutterBottom variant="h6" component="h6">
                  Ballot Submitted
                </Typography>}

              <Link to={`/Election/${data.election.election_id}/results`}>
                <Typography align='center' gutterBottom variant="h6" component="h6">
                  View Results
                </Typography>
              </Link>

              {
                // Not sure about /DuplicateElection/{id} or /Election/{id}/duplicate
                // /Election/{id}/duplicate feels more consistent, but we're not actually applying an operation to that election
                // /DuplicateElection/{id} mirrors /CreateElection, that feels more accurate?
              }
              <Link to={`/DuplicateElection/${data.election.election_id}`}>
                <Typography align='center' gutterBottom variant="h6" component="h6">
                  Duplicate
                </Typography>
              </Link>

              {data && data.election.state === 'draft' &&
                <>
                  <Link to={`/Election/${data.election.election_id}/edit`}>
                    <Typography align='center' gutterBottom variant="h6" component="h6">
                      Edit
                    </Typography>
                  </Link>
                  <Tooltip title="Opens election for ballots to be submitted and prevents future edits" >
                    <Button variant='outlined' onClick={() => finalizeElection()} > Finalize </Button>
                  </Tooltip>
                </>
              }


            </Grid>
          </Box>
        }
        {data && !data.voterAuth.authorized_voter && !data.voterAuth.required &&
          <Box border={2} sx={{ mt: 5, ml: 0, mr: 0, width: '100%' }}>
            <Grid container alignItems="center" justify="center" direction="column">
              <Typography align='center' gutterBottom variant="h4" component="h4">
                You are not authorized to vote in this election
              </Typography>
            </Grid>
          </Box>
        }
        {data && !data.voterAuth.authorized_voter && data.voterAuth.required && data.voterAuth.required === "Log In" &&
          <Box border={2} sx={{ mt: 5, ml: 0, mr: 0, width: '100%' }}>
            <Grid container alignItems="center" justify="center" direction="column">
              <Typography align='center' gutterBottom variant="h4" component="h4">
                You must log in to access this election
              </Typography>
            </Grid>
          </Box>
        }
        {data && !data.voterAuth.authorized_voter && data.voterAuth.required && data.voterAuth.required === "Voter ID" &&
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

export default ElectionHome
