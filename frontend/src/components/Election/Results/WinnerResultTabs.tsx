import React, {useState} from 'react'
import Typography from '@mui/material/Typography';
import {Paper, Box} from '@mui/material';

const WinnerResultTabs = ({children, numWinners}) => {
    const [currentTab, setCurrentTab] = useState(0);

    if(numWinners == 1) return <>{children}</>

    let i = 0;
    const roundIndexes = Array.from({length: numWinners}, () => i++);

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules/PluralRules
    const pr = new Intl.PluralRules("en-US", { type: "ordinal" });

    const suffixes = new Map([
        ["one", "st"],
        ["two", "nd"],
        ["few", "rd"],
        ["other", "th"],
    ]);
    const formatOrdinals = (n) => {
        const rule = pr.select(n);
        const suffix = suffixes.get(rule);
        return `${n}${suffix}`;
    };

    return <>
        {numWinners >= 5 && 
            <Typography variant="h6">Winners</Typography>
        }
        <Box display="flex" flexDirection="row" gap={0}>
            {roundIndexes.map((i) => (
                <div className={(i == currentTab)? 'winnerResultTab activewinnerResultTab' : 'winnerResultTab'} onClick={() => setCurrentTab(i)}>
                    {formatOrdinals(i+1)} {numWinners < 5 && 'Winner'}
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
