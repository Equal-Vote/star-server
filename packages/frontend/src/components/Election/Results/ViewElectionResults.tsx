import React, { useEffect, useState } from 'react'
import { useParams } from "react-router";
import Results from './Results';
import Box from '@mui/material/Box';
import { Paper, Typography } from "@mui/material";
import { DetailExpanderGroup, useSubstitutedTranslation } from '../../util';
import { useGetResults } from '../../../hooks/useAPI';
import useElection from '../../ElectionContextProvider';
import DraftWarning from '../DraftWarning';

const ViewElectionResults = () => {
    
    const { election } = useElection()
    
    const { data, isPending, error, makeRequest: getResults } = useGetResults(election.election_id)
    useEffect(() => { getResults() }, [])

    const {t} = useSubstitutedTranslation(election.settings.term_type);

    return (<>
        <DraftWarning/>
        <Box
            display='flex'
            justifyContent="center"
            alignItems="center"
            sx={{ width: '100%', textAlign: 'center'}}
        >
            <Paper elevation={3} sx={{width: '100%', maxWidth: '1200px', m: {xs: 0, m: 2}, p: {xs: 1, m: 2}, backgroundColor:'brand.white', marginBottom: 2, '@media print': { boxShadow: 'none'}}}>
                <Typography variant="h3" component="h3" sx={{marginBottom: 4}}>
                    {election.state === 'closed' ? t('results.official_title') : t('results.preliminary_title')}
                </Typography>
                <Typography variant="h4" component="h4">
                    {t('results.election_title', {title: election.title})}
                </Typography>
                {isPending && <div> {t('results.loading_election')} </div>}

                <DetailExpanderGroup defaultSelectedIndex={-1} allowMultiple>
                    {data?.results.map((result, race_index) => (
                        <Results 
                            key={`results-${race_index}`}
                            title={t('results.race_title', {n: race_index+1, title: election.races[race_index].title})}
                            raceIndex={race_index}
                            race={election.races[race_index]}
                            result={result}
                        />
                    ))}
                </DetailExpanderGroup>
                
            </Paper>
        </Box>
    </>)
}
export default ViewElectionResults

