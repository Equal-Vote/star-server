import { Box, Typography } from "@mui/material"
import useRace from "~/components/RaceContextProvider";
import { Tip } from "~/components/styles";
import { CHART_COLORS } from "~/components/util";
import ResultsKey from "./ResultsKey";

interface DataItem{
    name: string
    value: number
}

export default (
    {data} :
    {data: DataItem[]}
) => {
    const total = data.map(d => d.value).reduce((sum, v) => sum + v);

    return <Box sx={{mx: 8}}>
        <Box height='38px' display='flex' flexDirection='row'>
            {data.filter((d, i) => (d.value / total) > .001).map((d, i) => {
                let percent = `${Math.round((d.value / total)*100)}%`
                return <Box key={i} width={percent} sx={{backgroundColor:CHART_COLORS[i % CHART_COLORS.length], textAlign: 'left', pt: 1, pl: 1, fontSize: '1rem', overflow: 'visible', zIndex: 1}}>
                    {percent}
                </Box>
            })}
        </Box>
        <ResultsKey items={
           data.map((d, i) => ([CHART_COLORS[i % CHART_COLORS.length], d.name]))
        }/>
    </Box>
}