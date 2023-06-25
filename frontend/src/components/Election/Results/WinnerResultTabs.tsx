import React, {useState} from 'react'
import Typography from '@mui/material/Typography';
import {Paper, Box} from '@mui/material';

const WinnerResultTabs = ({children, rounds}) => {
    const [currentTab, setCurrentTab] = useState(0);

    if(rounds == 1) return <>{children}</>

    let i = 0;
    const roundIndexes = Array.from({length: rounds}, () => i++);

    return <>
        {rounds >= 5 && 
            <Typography variant="h6">Rounds</Typography>
        }
        <Box display="flex" flexDirection="row" gap={0}>
            {roundIndexes.map((i) => (
                <div className={(i == currentTab)? 'roundResultsTab activeRoundResultsTab' : 'roundResultsTab'} onClick={() => setCurrentTab(i)}>
                    {rounds < 5 && 'Round'} {i+1}
                </div> 
            ))}
        </Box>
        {children.map((child, i) => (
            <div className={(i == currentTab)? 'roundResults activeRoundResults' : 'roundResults'}>
                {child}
            </div>
        ))}
    </>
}

export default WinnerResultTabs
