import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Grid, IconButton, Paper, Typography } from '@mui/material'
import React, { useState, useRef, useEffect }  from 'react'

const DetailedResultsExpander = ({children, defaultSelectedIndex}) => {
    const [viewDetails, setViewDetails] = useState(false);
    const [widgetIndex, setWidgetIndex] = useState(defaultSelectedIndex);


    function scrollToElement(e){
        setTimeout(() => {
            // TODO: I feel like there's got to be an easier way to do this
            const openedSection = (e as HTMLElement);

            const elemTop = document.documentElement.scrollTop + openedSection.getBoundingClientRect().top;
            const elemBottom = elemTop + openedSection.scrollHeight;
            const windowTop = document.documentElement.scrollTop
            const windowBottom = windowTop + window.innerHeight;

            // scroll down if the element is below the window
            if(elemBottom > windowBottom){
                window.scrollTo({
                    top: elemBottom-window.innerHeight + 10,
                    behavior: 'smooth'   
                });
            }

            // scroll up if element is above the window
            if(elemTop < windowTop){
                window.scrollTo({
                    top: elemTop,
                    behavior: 'smooth'   
                });
            }
        }, 250);
    }

    return <>
        <div style={{display: 'flex', flexDirection: 'row', gap: 10, justifyContent: 'center', cursor: 'pointer', alignItems: 'center'}} onClick={() => {
            if(!viewDetails){
                scrollToElement(document.querySelector('.detailedWidgets'))
            }
            setViewDetails(!viewDetails)
        }}>
            <Typography variant='h4'>Detailed Results</Typography>
            {!viewDetails && <ExpandMore />}
            {viewDetails && <ExpandLess />}
        </div>
        <div className="detailedWidgets">
            {viewDetails && children.map((child,i) => (
                <Paper elevation={5} sx={{backgroundColor: 'brand.white', padding: '8px'}} >
                    <Grid container className='resultsDetailSection' alignItems="center" style={{cursor: 'pointer'}} onClick={() => {
                        if((widgetIndex != i)){
                            scrollToElement(document.querySelectorAll('.resultsDetailSection')[i].parentNode);
                        }
                        setWidgetIndex((widgetIndex == i)? -1 : i);
                    }}>
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
