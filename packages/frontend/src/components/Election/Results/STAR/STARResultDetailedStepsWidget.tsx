import { Box, Paper, Typography } from '@mui/material';
import { log } from 'console';
import React, { useState }  from 'react'
import { starResults } from '@equal-vote/star-vote-shared/domain_model/ITabulators';


const STARResultDetailedStepsWidget = ({ results, rounds, t}: {results: starResults, rounds: number, t: Function }) => {
    const showTieBreakerWarning = results.roundResults.some(round => (round.logs.some(log => (log.includes('tiebreaker')))));

    return <div className='detailedSteps'>
        {results.roundResults.map((round, r) => (
            <Box key={r}>
                {rounds > 1 && <Typography variant="h4">{`Winner ${r + 1}`}</Typography>}
                <ol style={{textAlign: 'left'}}>
                    {round.logs.map((log, i) => (<li key={i}>{log}</li>))}
                </ol>
            </Box>
        ))}
        { showTieBreakerWarning && <Paper sx={{backgroundColor: 'theme.gray4', width: '80%', marginLeft: '10%', marginRight: '10%'}}>
            <div style={{padding: '16px', display: 'flex', flexDirection: 'row', gap: '10px'}}>
                <p>⚠️</p>
                <div>
                    <b>{t('results.star.tiebreaker_note_title')}</b>️
                    {(t('results.star.tiebreaker_note_text') as Array<String>).map((s,i) => <p key={i}>{s}</p>)}
                </div>
            </div>
        </Paper> }
    </div>
}

export default STARResultDetailedStepsWidget;
