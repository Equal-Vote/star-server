import { Box, Typography } from "@mui/material"
import { CHART_COLORS } from "~/components/util";

export default (
    {leftName, rightName, leftVotes, rightVotes, total} :
    {leftName: string, rightName: string, leftVotes: number, rightVotes: number, total: number}
) => {
    let leftPercent = `${Math.round((leftVotes / total)*100)}%`;
    let rightPercent = `${Math.round((rightVotes / total)*100)}%`;
    let midVotes = total - leftVotes - rightVotes;
    let midPercent = `${Math.round((midVotes/total)*100)}%`;

    return <Box sx={{mx: 4}}>
        <Box display='flex' flexDirection='row' justifyContent='space-between' sx={{mb: 1}} gap={2}>
            <Typography sx={{textAlign: 'left', fontWeight: 'bold'}}>{leftName}</Typography>
            <Typography sx={{textAlign: 'right', fontWeight: 'bold'}}>{rightName}</Typography>
        </Box>
        <Box height='38px' display='flex' flexDirection='row'>
            {(leftVotes/total) > .01 &&
                <Box width={leftPercent} sx={{backgroundColor:CHART_COLORS[0], textAlign: 'left', pt: 1, pl: 1, fontSize: '1rem', overflow: 'visible', zIndex: 1}}>
                    {leftPercent}
                </Box>
            }
            {(midVotes/total) > .01 &&
                <Box width={midPercent} sx={{backgroundColor:'var(--brand-gray-1)', pt: 1}}>
                    {midVotes > .1 ? midPercent : ''}
                </Box>
            }
            {(rightVotes/total) > .01 &&
                <Box width={rightPercent} sx={{backgroundColor:CHART_COLORS[1], textAlign: 'right', pt: 1, pr: 1, fontSize: '1rem'}}>
                    {rightPercent}
                </Box>
            }
        </Box>
    </Box>
}