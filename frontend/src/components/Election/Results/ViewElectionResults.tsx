import React, { useEffect, useState } from 'react'
import { useParams } from "react-router";
import Results from './Results';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { Paper, Typography } from "@mui/material";
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { DetailExpanderGroup, scrollToElement } from '../../util';
import { useGetResults } from '../../../hooks/useAPI';
import useElection from '../../ElectionContextProvider';

const ViewElectionResults = () => {
    
    const { election } = useElection()
    
    const { data, isPending, error, makeRequest: getResults } = useGetResults(election.election_id)
    useEffect(() => { getResults() }, [])

    return (
        <Box
            display='flex'
            justifyContent="center"
            alignItems="center"
            sx={{ width: '100%', textAlign: 'center'}}
        >
            <Paper elevation={3} sx={{p:2,maxWidth:1200, backgroundColor:'brand.white', marginBottom: 2}}  >
                <Typography variant="h3" component="h3" sx={{marginBottom: 4}}>
                    {election.state === 'closed' ? 'OFFICIAL RESULTS' : 'PRELIMINARY RESULTS'}
                </Typography>
                <Typography variant="h4" component="h4">
                    Election Name:<br/>{election.title}
                </Typography>
                {isPending && <div> Loading Election... </div>}

                <DetailExpanderGroup defaultSelectedIndex={-1}>
                    {data?.results.map((result, race_index) => (
                        <Results 
                            title={`Race ${race_index+1}: ${election.races[race_index].title}`}
                            raceIndex={race_index}
                            race={election.races[race_index]}
                            result={result}
                        />
                    ))}
                </DetailExpanderGroup>
                
            </Paper>
        </Box>
    )
}
export default ViewElectionResults

