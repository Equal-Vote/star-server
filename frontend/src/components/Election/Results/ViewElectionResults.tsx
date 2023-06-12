import React, { useEffect } from 'react'
import { useParams } from "react-router";
import useFetch from "../../../hooks/useFetch";
import Results from './Results';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { Paper, Typography } from "@mui/material";

const ViewElectionResults = ({ election }) => {
    const { id } = useParams();
    const { data, isPending, error, makeRequest: getResults } = useFetch(`/API/ElectionResult/${id}`, 'get')
    useEffect(() => { getResults() }, [])

    return (
        <Box
            display='flex'
            justifyContent="center"
            alignItems="center"
            sx={{ width: '100%', textAlign: 'center' }}>
            <Paper elevation={3} sx={{p:2,maxWidth:1200, backgroundColor:'brand.white'}}  >
                <Typography variant="h3" component="h3" sx={{marginBottom: 4}}>
                    {election.state === 'closed' ? 'OFFICIAL RESULTS' : 'PRELIMINARY RESULTS'}
                </Typography>
                <Typography variant="h4" component="h4">
                    Election Name:<br/>{election.title}
                </Typography>
                {isPending && <div> Loading Election... </div>}
                {data?.Results.map((result, race_index) => (
                    <>
                        {election.races.length > 1 &&
                            <h2>
                                {`Race ${race_index}: ${election.races[race_index].title}`}
                            </h2>}
                            {
                        <Results race={election.races[race_index]} result={result} />
}
                        {race_index < election.races.length - 1 && <Divider />}
                    </>
                ))}
            </Paper>
        </Box>

    )
}
export default ViewElectionResults
