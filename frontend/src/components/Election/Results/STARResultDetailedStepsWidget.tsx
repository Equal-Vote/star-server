import { Typography } from '@mui/material';
import React, { useState }  from 'react'

const STARResultDetailedStepsWidget = ({title, results, rounds}) => {
    return <>
        {results.roundResults.map((round, r) => (
            <>
            {rounds > 1 && <h4>{`Winner ${r + 1}`}</h4>}
            {round.logs.map(log => (<p>{log}</p>))}
            </>
        ))}
    </>
}

export default STARResultDetailedStepsWidget;
