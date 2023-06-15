import React from 'react'
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ShareButton from "../ShareButton";
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { StyledButton } from "../../styles";
const Thanks = ({ election }) => {
    return (
        <>
            {election &&
                <Box
                    display="flex"
                    flexDirection='column'
                    justifyContent="center"
                    alignItems="center"
                    maxWidth={500}
                    mx='auto'
                    mb='100px'>
                    <Typography align='center' variant="h3" component="h3">
                        Ballot Submitted
                    </Typography>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <HowToVoteIcon sx={{ fontSize: 40 }} />
                    </div>
                    <Typography align='center' variant="h5" component="h5" sx={{ p: 2 }}>
                        Thank you for voting!
                    </Typography>

                    {election.state === 'open' && election.end_time &&
                        < Typography align='center' variant="h6" component="h6" sx={{ pb: 3 }}>
                            {`Election ends on ${new Date(election.end_time).toLocaleDateString()} at ${new Date(election.end_time).toLocaleTimeString()} `}
                        </Typography>
                    }

                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' } }} >
                        {(election.state === 'open' || election.state === 'closed') && election.settings.public_results === true &&
                            <Box sx={{ width: '100%',  p: 1, px:{xs: 5, sm: 1} }}>
                                <StyledButton
                                    type='button'
                                    variant='contained'
                                    fullwidth
                                    href={`/Election/${election.election_id}/results`} >
                                    Results
                                </StyledButton>
                            </Box>
                        }
                        {election.settings.voter_access !== 'closed' &&
                            <Box sx={{ width: '100%', p: 1, px:{xs: 5, sm: 1}  }}>
                                <ShareButton url={`${window.location.origin}/Election/${election.election_id}`} text={'Invite'} />
                            </Box>
                        }
                        <Box sx={{ width: '100%', p: 1, px:{xs: 5, sm: 1} }}>
                            <StyledButton
                                type='button'
                                variant='contained'
                                fullwidth
                                href={'https://www.starvoting.org/donate'} >
                                Donate
                            </StyledButton>
                        </Box>
                    </Box>
                </Box>
            }
        </>
    )
}

export default Thanks
