import { useParams } from "react-router";
import React from 'react'
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ShareButton from "../ShareButton";
import HowToVoteIcon from '@mui/icons-material/HowToVote';
const Thanks = ({ election }) => {
    return (
        <>
            {election &&
                <Box
                    justifyContent="center"
                    alignItems="center">

                    <Typography align='center' variant="h3" component="h3">
                        Ballot Submitted
                    </Typography>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <HowToVoteIcon sx={{ fontSize: 40 }} />
                    </div>

                    <Typography align='center' gutterBottom variant="h5" component="h5">
                        Thank you for voting!
                    </Typography>

                    {election.state === 'open' && election.end_time &&
                        < Typography align='center' gutterBottom variant="h6" component="h6">
                            {`Election ends on ${new Date(election.end_time).toLocaleDateString()} at ${new Date(election.end_time).toLocaleTimeString()} `}
                        </Typography>
                    }

                    <div style={{ display: 'flex', justifyContent: 'center'}}>
                        <Box sx={{maxWidth:200}}>
                            <ShareButton url={`${window.location.origin}/Election/${election.election_id}`} text={'Share'} />
                        </Box>
                    </div>
                    {(election.state === 'open' || election.state === 'closed') && election.settings.public_results === true &&
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button variant='outlined' href={`/Election/${election.election_id}/results`} sx={{ m: 1 }}>
                                View Results
                            </Button>
                        </div>
                    }
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography align='center' gutterBottom component="p">
                            <a target="_blank" href={'https://www.starvoting.org/donate'}>Donate</a> to help support STAR Voting campaigns
                        </Typography>
                    </div>
                </Box>
            }
        </>
    )
}

export default Thanks
