import React from 'react'
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Paper } from "@mui/material";
import ShareButton from "./ShareButton";
import VoterAuth from "./VoterAuth";
import { formatDate, useSubstitutedTranslation } from '../util';
import useElection from '../ElectionContextProvider';

const ElectionHome = () => {
  const { election, voterAuth, refreshElection, permissions, updateElection } = useElection();

  const {t} = useSubstitutedTranslation(election.settings.term_type);

  return (
    <>
      {election && voterAuth &&
        <Box
          display='flex'
          justifyContent="center"
          alignItems="center"
          sx={{ width: '100%', minWidth: {xs: 0, md: '500px'} }}>
          <Paper elevation={3} sx={{
            p: 3, maxWidth: 600, minHeight: 400,
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
                  {t('election_home.begin_time',{
                      date: new Date(election.start_time).toLocaleDateString(),
                      time: new Date(election.start_time).toLocaleTimeString()
                  })}
                </Typography>
              </Box>
            }

            {election.state === 'open' && <>

              {election.end_time &&
                <Box sx={{ flexGrow: 1 }}>
                  < Typography align='center' variant="h6" component="h6">
                    {t('election_home.end_time',{
                        date: new Date(election.end_time).toLocaleDateString(),
                        time: new Date(election.end_time).toLocaleTimeString()
                    })}
                  </Typography>
                </Box>}
              {
                voterAuth.has_voted == false && voterAuth.authorized_voter && !voterAuth.required &&

                <Box display='flex' flexDirection='column' alignItems='center' gap={5} sx={{ p: 1}}>
                  <Button fullWidth variant='contained' href={`/${String(election?.election_id)}/vote`} >
                    <Typography align='center' variant="h3" component="h3" fontWeight='bold' sx={{ p: 2 }}>
                      {t('election_home.vote')}
                    </Typography>
                  </Button>
                  {election.settings.public_results === true &&
                  <Button variant='text' href={`/${String(election?.election_id)}/results`} >
                      {t('election_home.or_view_results')}
                  </Button>
                  }
                </Box>
              }
            </>}

            {election.state === 'closed' && election.end_time &&
              <Box sx={{ flexGrow: 1 }}>
                <Typography align='center' variant="h6" component="h6">
                    {t('election_home.ended_time',{
                        date: new Date(election.end_time).toLocaleDateString(),
                        time: new Date(election.end_time).toLocaleTimeString()
                    })}
                </Typography>
              </Box>
            }
            {voterAuth.has_voted == true &&
              <Box display='flex' flexDirection='column' alignItems='center' gap={5} sx={{ p: 1}}>
                <Typography align='center' variant="h6" component="h6">
                  {t('election_home.ballot_submitted')}
                </Typography>
              </Box>
            }
            {/* Show results button only if public_results enabled and voter has voted or election is closed */}
            {(election.settings.public_results === true &&
              (election.state === 'open' && voterAuth.has_voted) || election.state === 'closed') &&
              <Box sx={{ p: 1, flexGrow: 0 }}>
                <Button fullWidth variant='outlined' href={`/${election.election_id}/results`} >
                  {t('election_home.view_results')}
                </Button>
              </Box>
            }
            {election.state === 'draft' &&
              <Box sx={{ flexGrow: 1 }}>
                <Typography align='center' variant="h6" component="h6">
                  {t('election_home.drafted')}
                </Typography>
              </Box>
            }
            {election.state === 'archived' &&
              <Box sx={{ flexGrow: 1 }}>
                <Typography align='center' variant="h6" component="h6">
                  {t('election_home.archived')}
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
