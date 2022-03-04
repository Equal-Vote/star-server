import React from 'react'
import { useParams } from "react-router";
import useFetch from "../useFetch";
import Results from './Results';
import { Grid } from "@material-ui/core";
import Box from '@material-ui/core/Box';

const ViewElectionResults = () => {
    const {id} = useParams();
    const {data, isPending, error} = useFetch(`/API/ElectionResult/${id}`)
    console.log(data)
    return (
        //Using grid to force results into the center and fill screen on smaller screens.
        //Using theme settings and css can probably replace the grids
        <Grid container spacing={0}>
            <Grid item xs={12} sm={2}>
            </Grid>
             <Grid item xs={12} sm={8}>
                <Box border={2} sx={{ mt: 5, width: '100%', p:2}}>
                    { error && <div> {error} </div>}
                    { isPending && <div> Loading Election... </div>}
                    {data && (
                        <Results data = {data}/>)}
                </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
            </Grid>
        </Grid>
    )
}
export default ViewElectionResults
