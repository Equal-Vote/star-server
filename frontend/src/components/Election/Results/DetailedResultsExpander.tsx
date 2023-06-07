import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Grid, IconButton, Paper } from '@mui/material'
import React, { useState, useRef, useEffect }  from 'react'

const DetailedResultsExpander = ({children, defaultSelectedIndex}) => {
    const [viewDetails, setViewDetails] = useState(false);
    const [widgetIndex, setWidgetIndex] = useState(defaultSelectedIndex);

    return <>
        <Grid container alignItems="center" >
            <Grid item xs={11}>
            <h2>Detailed Results</h2>
            </Grid>
            <Grid item xs={1}>
            {!viewDetails &&
                <IconButton onClick={() => { setViewDetails(true) }}>
                    <ExpandMore />
                </IconButton>}
            {viewDetails &&
                <IconButton  onClick={() => { setViewDetails(false) }}>
                    <ExpandLess />
                </IconButton>}
            </Grid>
        </Grid>
        <div className="detailedWidgets">
            {viewDetails && children.map((child,n) => (
                <Paper sx={{backgroundColor: 'brand.gray1', padding: '8px'}}>
                    <Grid container alignItems="center" >
                        <Grid item xs={11}>
                            <h3>{child.props.title}</h3>
                        </Grid>
                        <Grid item xs={1}>
                        {(widgetIndex != n) &&
                            <IconButton onClick={() => { setWidgetIndex(n); }}>
                                <ExpandMore />
                            </IconButton>
                        }
                        {(widgetIndex == n) &&
                            <IconButton onClick={() => { setWidgetIndex(-1); }}>
                                <ExpandLess />
                            </IconButton>
                        }
                        </Grid>
                    </Grid>
                        {(widgetIndex == n) && 
                            <>
                                <hr/>
                                {child}
                            </>
                        }
                </Paper>
            ))}
        </div>
    </>;
}

export default DetailedResultsExpander ;
