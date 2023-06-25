import React, {useState} from 'react'
import Typography from '@mui/material/Typography';
import {Paper, Box} from '@mui/material';

const WinnerResultTabs = ({children, num_winners}) => {
    const [currentTab, setCurrentTab] = useState(0);

    if(num_winners == 1) return <>{children}</>

    let i = 0;
    const roundIndexes = Array.from({length: num_winners}, () => i++);

    return <>
        {num_winners >= 5 && 
            <Typography variant="h6">num_winners</Typography>
        }
        <Box display="flex" flexDirection="row" gap={0}>
            {roundIndexes.map((i) => (
                <div className={(i == currentTab)? 'winnerResultTab activewinnerResultTab' : 'winnerResultTab'} onClick={() => setCurrentTab(i)}>
                    {num_winners < 5 && 'Round'} {i+1}
                </div> 
            ))}
        </Box>
        {children.map((child, i) => (
            <div className={(i == currentTab)? 'winnerResult activeWinnerResults' : 'winnerResult'}>
                {child}
            </div>
        ))}
    </>
}

export default WinnerResultTabs
