import { Box, Paper, Typography } from '@mui/material';
import { log } from 'console';
import React, { useState }  from 'react'
import { starResults } from '@equal-vote/star-vote-shared/domain_model/ITabulators';


const STARResultDetailedStepsWidget = ({ results, rounds, t}: {results: starResults, rounds: number, t: Function }) => {

    // Note: there are other keys I don't want to show, but at least one of
    //       these will be used if the tiebreaker process is used
    const warningKeys = [
        'tabulator_logs.star.pairwise_tiebreak_start',
        'tabulator_logs.star.score_tiebreak_start',
    ];
    const showTieBreakerWarning = results.roundResults.some(round => (round.logs.some(log =>
        typeof log !== 'string' && warningKeys.includes(log.key)
    )))

    return <div className='detailedSteps'>
        {results.roundResults.map((round, r) => (
            <Box key={r}>
                {rounds > 1 && <Typography variant="h4">{`Winner ${r + 1}`}</Typography>}
                <ol style={{textAlign: 'left'}}>
                    {round.logs.map((log, i) => (<li key={i}>
                        {typeof log === 'string' ? log : t(log['key'], log)}
                    </li>))}
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
