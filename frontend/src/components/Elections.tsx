import ElectionCard from "./ElectionCard"
import Button from "./Button"
import useFetch from "../useFetch"
import { Link } from "react-router-dom"
import React from 'react'
import { Election } from "../../../domain_model/Election"
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

const theme = createTheme();
const Elections = () => {
    const { data, isPending, error } = useFetch('/API/Elections')
    let elections = data as Election[];
    console.log(elections)
    return (
        <ThemeProvider theme={theme}>
            <main>
                {error && <div> {error} </div>}
                {isPending && <Typography align='center' variant="h3" component="h2"> Loading Elections... </Typography>}
                {/* { elections && <Button color='steelblue' text='New Election' onClick={onNewElection} />} */}
                {elections && <div><Link to='/CreateElection'> <Typography align='center' variant="h4" component="h3"> Create New Election</Typography></Link></div>}
                <Container maxWidth="md">
                    <Grid container alignItems="stretch" spacing={4}>
                        {elections && elections.map((election) => (
                            <Grid item xs={12} >
                                <ElectionCard key={election.election_id} election={election}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </main>
        </ThemeProvider>
    )
}

export default Elections
