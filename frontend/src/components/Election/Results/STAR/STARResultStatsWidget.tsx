import { Typography } from '@mui/material';
import React, { useState }  from 'react'
import { starResults } from '../../../../../../domain_model/ITabulators';

const STARResultStatsWidget = ({ results}: {results: starResults }) => {
    return <div className="statsWidget">
        <Typography>
            <strong>{results.summaryData.nValidVotes}</strong> valid votes cast
        </Typography>
        <Typography>
            <strong>{results.summaryData.nInvalidVotes}</strong> invalid votes cast
        </Typography>
        <Typography>
            <strong>{results.summaryData.nBulletVotes}</strong> bullet votes
        </Typography>
        <Typography>
            <strong>{results.summaryData.nUnderVotes}</strong> under votes
        </Typography>
    </div>
}

export default STARResultStatsWidget;
