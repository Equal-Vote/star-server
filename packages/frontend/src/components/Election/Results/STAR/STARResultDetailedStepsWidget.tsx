import { Paper, Typography } from '@mui/material';
import { log } from 'console';
import React, { useState }  from 'react'
import { starResults } from 'shared/domain_model/ITabulators';

const STARResultDetailedStepsWidget = ({ results, rounds}: {results: starResults, rounds: number }) => {
    const showTieBreakerWarning = results.roundResults.some(round => (round.logs.some(log => (log.includes('tiebreaker')))));

    return <div className='detailedSteps'>
        {results.roundResults.map((round, r) => (
            <>
            {rounds > 1 && <Typography variant="h4">{`Winner ${r + 1}`}</Typography>}
            <ol style={{textAlign: 'left'}}>
                {round.logs.map(log => (<li>{log}</li>))}
            </ol>
            </>
        ))}
        { showTieBreakerWarning && <Paper sx={{backgroundColor: 'theme.gray4', width: '80%', marginLeft: '10%', marginRight: '10%'}}>
            <div style={{padding: '16px', display: 'flex', flexDirection: 'row', gap: '10px'}}>
                <p>⚠️</p>
                <p>
                    <b>A note on Tiebreakers</b><br/><br/>
                    Ties are very rare under STAR Voting, and especially as you get more voters. 
                    <br/><br/>
                    It's more than 10 times less likely for ties to occur under STAR than under choose-one voting.
                    <br/><br/>
                    However in the unlikely event a tie does occur, the tie is broken using the <a href='https://www.starvoting.org/ties'>Offical Tiebreaker Protocol</a>.
                </p>
            </div>
        </Paper> }
    </div>
}

export default STARResultDetailedStepsWidget;
