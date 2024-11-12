import { Box, Typography } from "@mui/material"
import { CHART_COLORS } from "~/components/util";

export default (
    {leftName, rightName, leftVotes, rightVotes, total} :
    {leftName: string, rightName: string, leftVotes: number, rightVotes: number, total: number}
) => {
    let leftValue = leftVotes / total;
    let midValue = (total - leftVotes - rightVotes) / total;
    let rightValue = rightVotes / total;
    let leftPercent = `${Math.round(leftValue*100)}%`;
    let rightPercent = `${Math.round(rightValue*100)}%`;
    let midPercent = `${Math.round(midValue*100)}%`;

    return <Box sx={{mx: 4}}>
        <Box display='flex' flexDirection='row' justifyContent='space-between' sx={{mb: 1}} gap={2}>
            <Typography sx={{textAlign: 'left', fontWeight: 'bold'}}>{leftName}</Typography>
            <Typography sx={{textAlign: 'right', fontWeight: 'bold'}}>{rightName}</Typography>
        </Box>
        <Box height='38px' display='flex' flexDirection='row'>
            {leftValue > 0 &&
                <Box width={leftPercent} sx={{backgroundColor:CHART_COLORS[0], textAlign: 'left', pt: 1, pl: 1, fontSize: '1rem', overflow: 'visible', zIndex: 1}}>
                    {(leftValue > rightValue)? '⭐ ': ''}{leftPercent}
                </Box>
            }
            {midValue > 0 &&
                <Box width={midPercent} sx={{backgroundColor:'var(--brand-gray-1)', pt: 1}}>
                    {(midValue < .1 || midValue+leftValue < .2 || midValue+rightValue < .2)? '' : midPercent}
                </Box>
            }
            {rightValue > 0 &&
                <Box width={rightPercent} sx={{backgroundColor:CHART_COLORS[1], textAlign: 'right', pt: 1, pr: 1, fontSize: '1rem'}}>
                    {(rightValue > leftValue)? '⭐ ': ''}{rightPercent}
                </Box>
            }
        </Box>
    </Box>
}