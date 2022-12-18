import useFetch from "../../../hooks/useFetch";
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
import ShareButton from "../ShareButton";

const Thanks = ({ election }) => {
    const { id } = useParams();


    return (
        <>
            {election &&
                <Box
                    display='flex'
                    justifyContent="center"
                    alignItems="center">
                    <Paper elevation={3} sx={{p:1}}>

                        <Typography align='center' gutterBottom variant="h3" component="h3">
                            Ballot Submitted
                        </Typography>
                        <Typography align='center' gutterBottom variant="h4" component="h4">
                            Thank you for voting!
                        </Typography>

                        {election.state === 'open' && election.end_time &&
                            < Typography align='center' gutterBottom variant="h6" component="h6">
                                {`Election ends on ${new Date(election.end_time).toLocaleDateString()} at ${new Date(election.end_time).toLocaleTimeString()} `}
                            </Typography>
                        }

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <ShareButton url={`${window.location.origin}/Election/${election.election_id}`} text={'Share'}/>
                        </div>
                        {(election.state === 'open' || election.state === 'closed') &&  election.settings.public_results===true &&
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Button variant='outlined' href={`/Election/${election.election_id}/results`} sx={{m:1}}>
                                    View Results
                                </Button>
                            </div>
                        }
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Typography align='center' gutterBottom variant="h6" component="h6">
                                Want to help support STAR Voting campaigns?
                            </Typography>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button variant='outlined' target="_blank" href={'https://www.starvoting.org/donate'} >
                                Donate
                            </Button>
                        </div>
                    </Paper>
                </Box>
            }
        </>
    )
}

export default Thanks
