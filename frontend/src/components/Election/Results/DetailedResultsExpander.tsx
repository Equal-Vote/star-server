import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Grid, IconButton, Paper } from '@mui/material'
import React, { useState, useRef, useEffect }  from 'react'

const DetailedResultsExpander = ({children, defaultSelectedIndex}) => {
    const [viewDetails, setViewDetails] = useState(false);
    const [widgetIndex, setWidgetIndex] = useState(defaultSelectedIndex);

    return <>
        <div style={{display: 'flex', flexDirection: 'row', gap: 10, justifyContent: 'center', cursor: 'pointer', alignItems: 'center'}} onClick={() => { setViewDetails(!viewDetails) }}>
            <h2>Detailed Results</h2>
            {!viewDetails && <ExpandMore />}
            {viewDetails && <ExpandLess />}
        </div>
        <div className="detailedWidgets">
            {viewDetails && children.map((child,i) => (
                <Paper sx={{backgroundColor: 'brand.gray1', padding: '8px'}} >
                    <Grid container alignItems="center" style={{cursor: 'pointer'}} onClick={() => { setWidgetIndex((widgetIndex == i)? -1 : i); }}>
                        <Grid item xs={11}>
                            <h3>{child.props.title}</h3>
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
