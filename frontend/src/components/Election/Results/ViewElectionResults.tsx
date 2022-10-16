import React, { useEffect } from 'react'
import { useParams } from "react-router";
import useFetch from "../../../useFetch";
import Results from './Results';
import { Grid } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';

const ViewElectionResults = ({ election }) => {
    const { id } = useParams();
    const { data, isPending, error, makeRequest: getResults } = useFetch(`/API/ElectionResult/${id}`, 'get')
    useEffect(() => { getResults() }, [])

    console.log(data)
    return (
        //Using grid to force results into the center and fill screen on smaller screens.
        //Using theme settings and css can probably replace the grids
        <Grid container spacing={0}>
            <Grid item xs={12} sm={2}>
            </Grid>
            <Grid item xs={12} sm={8}>
                <Box border={2} sx={{ mt: 5, width: '100%', p: 2 }}>
                    <h1>{`${election.title} Results`}</h1>
                    {error && <div> {error} </div>}
                    {isPending && <div> Loading Election... </div>}
                    {data?.Results.map((result, race_index) => (
                        <>
                            {election.races.length>1 && 
                            <h2>
                                {`${election.races[race_index].title} Results`}
                            </h2>}
                            <Results race={election.races[race_index]} result={result} />
                            {race_index<election.races.length-1 && <Divider />}
                        </>
                    ))}
                </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
            </Grid>
        </Grid>
    )
}
export default ViewElectionResults
