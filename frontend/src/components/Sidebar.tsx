import * as React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { Button, Grid } from '@material-ui/core';
import { Link } from 'react-router-dom';

const ListItem = ({ text, link }) => {
    return (
        <Grid item>
            <Button component={Link} to={link} >
                <Typography align='center' gutterBottom variant="h6" component="h6">
                    {text}
                </Typography>
            </Button>
        </Grid>
    )
}

export default function Sidebar({ electionData }) {
    const id = electionData.election.election_id;
    return (
        <>
            {electionData.voterAuth && electionData.voterAuth.roles && electionData.voterAuth.roles.length > 0 &&
                <Box border={2} sx={{ display: 'flex', mt: 5, ml: 0, mr: 0, width: '100%' }}>
                    <Grid container justify="center" direction="column" >
                        {electionData.election.state === 'draft' &&
                            <ListItem text='Edit Election' link={`/Election/${id}/edit`} />}
                        <ListItem text='Voter Rolls' link={`/Election/${id}/admin`} />
                    </Grid>
                </Box>
            }
        </>
    );
}
