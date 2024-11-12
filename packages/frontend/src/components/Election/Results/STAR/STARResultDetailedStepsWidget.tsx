import { Box, Paper, Typography } from '@mui/material';
import { log } from 'console';
import React, { useState }  from 'react'
import { starResults } from '@equal-vote/star-vote-shared/domain_model/ITabulators';
import Widget from '../components/Widget';


const STARResultDetailedStepsWidget = ({ results, rounds, t, filterRandomFromLogs}: {results: starResults, rounds: number, t: Function, filterRandomFromLogs: boolean }) => {

    // Note: there are other keys I don't want to show, but at least one of
    //       these will be used if the tiebreaker process is used
    const warningKeys = [
        'tabulation_logs.star.scoring_round_tiebreaker_start',
        'tabulation_logs.star.runoff_round_tiebreaker_start',
    ];
    const showTieBreakerWarning = results.roundResults.some(round => (round.logs.some(log =>
        typeof log !== 'string' && warningKeys.includes(log.key)
    )))

    let logs = (t('results.star.tiebreaker_note_text') as Array<String>)
    // this approach is a bit error prone, but it works for now
    if(filterRandomFromLogs) logs = logs.slice(0, logs.length-2);
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
        { showTieBreakerWarning && <Paper elevation={2} sx={{backgroundColor: 'theme.gray4', width: '90%', margin: 'auto', textAlign: 'left', padding: 3}}>
            <b>{t('results.star.tiebreaker_note_title')}</b>️
            <hr/>
            {logs.slice(0, ).map((s,i) => <p key={i}>{s}</p>)}
        </Paper> }
    </div>
}

export default STARResultDetailedStepsWidget;
