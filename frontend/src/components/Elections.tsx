import ElectionCard from "./ElectionCard"
import Button from "./Button"
import useFetch from "../hooks/useFetch"
import { Link } from "react-router-dom"
import React, { useEffect } from 'react'
import { Election } from "../../../domain_model/Election"
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { Box } from "@mui/material"

const Elections = ({ authSession }) => {

    const url_params = new URLSearchParams(window.location.search)
    var url = '/API/Elections';
    if (url_params.has('filter')) {
        url = `${url}?filter=${url_params.get('filter')}`
    }
    console.log(`fetch ${url}`)
    const { data, isPending, error, makeRequest: fetchElections } = useFetch(url, 'get')

    useEffect(() => {
        fetchElections()
    }, [url])
    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            minHeight: '600px',
            justifyContent: 'center',
            pt: { xs: 0, md: '0' },
        }}>
            {isPending && <Typography align='center' variant="h3" component="h2"> Loading Elections... </Typography>}
            <Container sx={{ m: 0, p: 0 }}>
                <Grid container sx={{ m: 0, p: 0 }}>
                    {data?.elections && data.elections.map((election) => (
                        <Grid item xs={12} >
                            <ElectionCard key={election.election_id} election={election}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    )
}

export default Elections
