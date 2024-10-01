import React, { useEffect, useState } from 'react'
import { useParams } from "react-router";
import Results from './Results';
import Box from '@mui/material/Box';
import { Paper, Typography } from "@mui/material";
import { useSubstitutedTranslation } from '../../util';
import { useGetResults } from '../../../hooks/useAPI';
import useElection from '../../ElectionContextProvider';
import DraftWarning from '../DraftWarning';
import { StyledButton } from '~/components/styles';
import ShareButton from '../ShareButton';
import { BallotDataExport } from './BallotDataExport';
import { useGetBallots } from '~/hooks/useAPI';

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

                    {data?.results.map((result, race_index) => (
                        <Results 
                            key={`results-${race_index}`}
                            title={t('results.race_title', {n: race_index+1, title: data.election.races[race_index].title})}
                            raceIndex={race_index}
                            race={data.election.races[race_index]}
                            result={result}
                        />
                    ))}
                    <hr/>
                    <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2}}>
                            <Box sx={{ width: '100%', maxWidth: 750, display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' } }} >
                        {(election.settings.public_results === true) &&
                            <Box sx={{ width: '100%',  p: 1, px:{xs: 5, sm: 1} }}>
                                <BallotDataExport election={election}/>
                            </Box>
                            }
                        
                        {election.settings.voter_access !== 'closed' &&
                            <Box sx={{ width: '100%', p: 1, px:{xs: 5, sm: 1}  }}>
                                <ShareButton url={`${window.location.origin}/${election.election_id}`}/>
                            </Box>
                        }
                        <Box sx={{ width: '100%', p: 1, px:{xs: 5, sm: 1} }}>
                            <StyledButton
                                type='button'
                                variant='contained'
                                fullwidth
                                href={'https://www.equal.vote/donate'} >
                                {t('ballot_submitted.donate')}
                            </StyledButton>
                        </Box>
                    </Box>
                </Box>
                
            </Paper>
        </Box>
    </>)
}
export default ViewElectionResults

