import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Grid, IconButton, Paper, Typography } from '@mui/material'
import React, { useState, useRef, useEffect }  from 'react'

const DetailedResultsExpander = ({children, defaultSelectedIndex}) => {
    const [viewDetails, setViewDetails] = useState(false);
    const [widgetIndex, setWidgetIndex] = useState(defaultSelectedIndex);

    return <>
        <div style={{display: 'flex', flexDirection: 'row', gap: 10, justifyContent: 'center', cursor: 'pointer', alignItems: 'center'}} onClick={() => { setViewDetails(!viewDetails) }}>
            <Typography variant='h4'>Detailed Results</Typography>
            {!viewDetails && <ExpandMore />}
            {viewDetails && <ExpandLess />}
        </div>
        <div className="detailedWidgets">
            {viewDetails && children.map((child,i) => (
                <Paper elevation={5} sx={{backgroundColor: 'brand.white', padding: '8px'}} >
                    <Grid container alignItems="center" style={{cursor: 'pointer'}} onClick={() => { setWidgetIndex((widgetIndex == i)? -1 : i); }}>
                        <Grid item xs={11}>
                            <Typography variant='h5'>{child.props.title}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                        <IconButton>
                            {(widgetIndex != i) && <ExpandMore />}
                            {(widgetIndex == i) && <ExpandLess />}
                        </IconButton>
                        </Grid>
                    </Grid>
                    {(widgetIndex == i) && 
                        <>
                            <hr/>
                            <div style={{textAlign: 'left'}}>
                                {child}
                            </div>
                        </>
                    }
                </Paper>
            ))}
        </div>
    </>;
}

export default DetailedResultsExpander ;
