import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { Paper } from '@mui/material';

const ListItem = ({ text, link }) => {
    return (
        <Grid item>
            <Button component={Link} to={link} fullWidth >
                <Typography align='center' gutterBottom variant="h6" component="h6">
                    {text}
                </Typography>
            </Button>
        </Grid>
    )
}

export default function Sidebar({ electionData }) {
    const id = electionData.election.election_id;
    console.log(electionData)
    return (
        <>
            {electionData.voterAuth?.roles?.length > 0 &&
                <Box
                    display='flex'
                    justifyContent="center"
                    alignItems="center"
                    sx={{ width: '100%' }}>
                    <Paper elevation={3} sx={{ width: 600 }} >
                        <Grid direction="column" >
                            <ListItem text='Home' link={`/Election/${id}/`} />
                            {electionData.election.state === 'draft' &&
                                <ListItem text='Edit Election' link={`/Election/${id}/edit`} />}
                            <ListItem text='Voter Rolls' link={`/Election/${id}/admin`} />
                        </Grid>
                    </Paper>
                </Box>
            }
        </>
    );
}
