import ElectionCard from "./ElectionCard"
import Button from "./Button"
import useFetch from "../useFetch"
import { Link } from "react-router-dom"
import React, { useEffect } from 'react'
import { Election } from "../../../domain_model/Election"
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

const theme = createTheme();
const Elections = ({authSession}) => {

    const url_params = new URLSearchParams(window.location.search)
    var url = '/API/Elections';
    if(url_params.has('filter')){
        url = `${url}?filter=${url_params.get('filter')}`
    }
    console.log(`fetch ${url}`)
    const { data, isPending, error, makeRequest: fetchElections } = useFetch(url,'get')

    useEffect(() => {
        fetchElections()
    },[url])

    let elections = data as Election[];
    console.log(JSON.stringify(elections));
    return (
        <ThemeProvider theme={theme}>
            <main>
                {error && <div> {error} </div>}
                {isPending && <Typography align='center' variant="h3" component="h2"> Loading Elections... </Typography>}
                {authSession.isLoggedIn() && <Link to='/CreateElection'> <Typography align='center' variant="h4" component="h3"> Create New Election</Typography></Link>}
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
