import React from 'react'
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Paper } from "@mui/material";
import ShareButton from "./ShareButton";
import VoterAuth from "./VoterAuth";
import { formatDate } from '../util';
import useElection from '../ElectionContextProvider';

const ElectionHome = () => {
  const { election, voterAuth, refreshElection, permissions, updateElection } = useElection();

  return (
    <>
      {election && voterAuth &&
        <Box
          display='flex'
          justifyContent="center"
          alignItems="center"
          sx={{ width: '100%' }}>
          <Paper elevation={3} sx={{
            p: 3, width: 600, minHeight: 400,
            display: 'flex',
            flexDirection: 'column', justifyContent: 'space-between'
          }} >
            {/* Only show share button if election voter access is not closed  */}
            {election.settings.voter_access !== 'closed' &&
              <Box sx={{ m: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Box sx={{ maxWidth: 200 }}>
                  <ShareButton url={`${window.location.origin}/Election/${election.election_id}`} />
                </Box>
              </Box>
            }
            <Box sx={{ flexGrow: 0 }}>
              <Typography align='center' gutterBottom variant="h3" component="h3" fontWeight={'bold'}>
                {election.title}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Typography align='center' component="p" style={{ whiteSpace: 'pre-line' }}>
                {election.description}
              </Typography>
            </Box>

            <VoterAuth />


            {election.state === 'finalized' && election.start_time &&
              <Box sx={{ flexGrow: 1 }}>
                <Typography align='center' variant="h6" component="h6">
                  {`Election begins on ${formatDate(election.start_time, election.settings.time_zone)}`}
                </Typography>
              </Box>
            }

            {election.state === 'open' && <>

              {election.end_time &&
                <Box sx={{ flexGrow: 1 }}>
                  < Typography align='center' variant="h6" component="h6">
                    {`Election ends on ${formatDate(election.end_time, election.settings.time_zone)}`}
                  </Typography>
                </Box>}
              {
                voterAuth.has_voted == false && voterAuth.authorized_voter && !voterAuth.required &&

                <Box sx={{ flexGrow: 1, p: 1 }}>
                  <Button fullWidth variant='outlined' href={`/${String(election?.election_id)}/vote`} >
                    <Typography align='center' variant="h3" component="h3" fontWeight='bold' sx={{ p: 2 }}>
                      Vote
                    </Typography>
                  </Button>
                </Box>
              }
            </>}

            {election.state === 'closed' && election.end_time &&
              <Box sx={{ flexGrow: 1 }}>
                <Typography align='center' variant="h6" component="h6">
                  {`Election ended on ${formatDate(election.end_time, election.settings.time_zone)}`}
                </Typography>
              </Box>
            }
            {voterAuth.has_voted == true &&
              <Box sx={{ flexGrow: 1 }}>
                <Typography align='center' variant="h6" component="h6">
                  Ballot Submitted
                </Typography>
              </Box>
            }
            {/* Show results button only if public_results enabled and voter has voted or election is closed */}
            {(election.settings.public_results === true &&
              (election.state === 'open' && voterAuth.has_voted) || election.state === 'closed') &&
              <Box sx={{ p: 1, flexGrow: 0 }}>
                <Button fullWidth variant='outlined' href={`/${election.election_id}/results`} >
                  View Results
                </Button>
              </Box>
            }
            {election.state === 'draft' &&
              <Box sx={{ flexGrow: 1 }}>
                <Typography align='center' variant="h6" component="h6">
                  This election is still being drafted
                </Typography>
              </Box>
            }
            {election.state === 'archived' &&
              <Box sx={{ flexGrow: 1 }}>
                <Typography align='center' variant="h6" component="h6">
                  This election has been archived
                </Typography>
              </Box>
            }
          </Paper>
        </Box>
      }
    </>
  )
}

export default ElectionHome
