import React, { useEffect, useState } from 'react'
import { useParams } from "react-router";
import Results from './Results';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { Paper, Typography } from "@mui/material";
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { scrollToElement } from '../../util';
import { useGetResults } from '../../../hooks/useAPI';

const ViewElectionResults = ({ election }) => {
    const { data, isPending, error, makeRequest: getResults } = useGetResults(election.election_id)
    const [selectedRaceIndex, setSelectedRaceIndex] = useState((election.races.length == 1)? 0 : -1);
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

                <div style={{display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', alignItems: 'center'}}>
                    {data?.Results.map((result, race_index) => (
                        <>
                            <Paper className={`raceResultsPanel-${race_index}`} elevation={5} style={{width: '100%'}} sx={{backgroundColor: 'brand.white', padding: '8px'}} >
                                {election.races.length > 1 &&
                                    <div style={{display: 'flex', flexDirection: 'row', gap: 10, justifyContent: 'center', cursor: 'pointer', alignItems: 'center'}} onClick={() => {
                                        if(selectedRaceIndex !== race_index){
                                            scrollToElement(document.querySelector(`.raceResultsPanel-${race_index}`))
                                        }
                                        setSelectedRaceIndex(selectedRaceIndex === race_index? -1 : race_index)
                                    }}>
                                        <Typography variant="h5">
                                            {`Race ${race_index+1}: ${election.races[race_index].title}`}
                                        </Typography>
                                        {selectedRaceIndex !== race_index && <ExpandMore />}
                                        {selectedRaceIndex === race_index && <ExpandLess />}
                                    </div>
                                }
                                {selectedRaceIndex === race_index &&
                                    <>
                                        {election.races.length > 1 && <hr/>}
                                        <Results raceIndex={race_index} race={election.races[race_index]} result={result} />
                                    </>
                                }
                            </Paper>
                            {race_index < election.races.length - 1 && <Divider />}
                        </>
                    ))}
                </div>
            </Paper>
        </Box>

    )
}
export default ViewElectionResults
