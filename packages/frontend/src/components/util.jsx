import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Box, Grid, IconButton, Paper, TableContainer, Typography } from '@mui/material'
import React, { useState, useRef, useEffect }  from 'react'
import _uniqueId from 'lodash/uniqueId';
import { DateTime } from 'luxon'


export const WidgetContainer = ({children}) => <Box display='flex' flexDirection='row' flexWrap='wrap' gap='30px' className="graphs" justifyContent='center' sx={{marginBottom: '30px'}}>{children}</Box>

export const Widget = ({children, title}) => <Paper elevation={5} className='graph' sx={{
    width: '100%', // maybe I'll try 90?
    maxWidth: '500px',
    backgroundColor: 'brand.white',
    borderRadius: '10px',
    padding: '18px',
    paddingTop: 0, /* the margin from the h3 tags is enough */
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pageBreakInside: 'avoid',
}}>
    <Typography variant="h5">{title}</Typography>
    {children}
</Paper>

export const makeResultTable = (className, arr) => {
    let c = `resultTable ${className}`;

    return <TableContainer sx={{ marginLeft: 'auto', marginRight: 'auto', maxHeight: 600, width: '100%'}}>
        <table className={c}>
            <thead className={c}>
                <tr> {arr[0].map(header => <th className={c}>{header}</th>)} </tr>
            </thead>

            <tbody>
                {arr.slice(1).map((row, i) =>
                    <tr className={c} key={i}> {row.map((value, j) =>
                        <td className={c} style={{paddingLeft: j == 0 ? '8px' : '0'}}>{value}</td>
                    )}</tr>
                )}
            </tbody>
        </table>
    </TableContainer>
}

export function scrollToElement(e){
    setTimeout(() => {
        // TODO: I feel like there's got to be an easier way to do this
        let openedSection = (typeof e === 'function')? e() : e;

        if(NodeList.prototype.isPrototypeOf(openedSection)){
            // NOTE: NodeList could contain a bunch of hidden elements with height 0, so we're filtering those out
            openedSection = Array.from(openedSection).filter((e) => {
                const box = e.getBoundingClientRect();
                return (box.bottom - box.top) > 0;
            })
            if(openedSection.length == 0) return;
            openedSection = openedSection[0];
        }

        const navBox = document.querySelector('header').getBoundingClientRect();
        const navHeight = navBox.bottom - navBox.top;

        const elemTop = document.documentElement.scrollTop + openedSection.getBoundingClientRect().top - 30;
        const elemBottom = elemTop + openedSection.scrollHeight;
        const windowTop = document.documentElement.scrollTop;
        const windowBottom = windowTop + window.innerHeight;

        if(elemTop < windowTop || elemBottom > windowBottom){
            window.scrollTo({
                top: elemTop - navHeight,
                behavior: 'smooth'   
            });
        }
    }, 250);
}

export const DetailExpander = ({children, title}) => {
    const [viewDetails, setViewDetails] = useState(false);
    const expanderId = _uniqueId('detailExpander-')

    return <>
        <Box className={`detailExpander ${expanderId}`}
            sx={{
                display: 'flex', flexDirection: 'row', gap: 10, justifyContent: 'center', cursor: 'pointer', alignItems: 'center',
            }}
            onClick={() => {
                if(!viewDetails) scrollToElement(document.querySelector(`${expanderId}:first-child`))
                setViewDetails(!viewDetails)
            }}
        >
            <Typography variant='h6' sx={{'@media print': {display: 'none'}}}>{title}</Typography>
            {!viewDetails && <ExpandMore sx={{'@media print': {display: 'none'}}}/>}
            {viewDetails && <ExpandLess sx={{'@media print': {display: 'none'}}}/>}
        </Box>
        {viewDetails && children}
    </>
}

export const DetailExpanderGroup = ({children, defaultSelectedIndex, allowMultiple=false}) => {
    const [openedWidgets, setOpenedWidgets] = useState([]);

    const groupRef = useRef(null);

    if(!Array.isArray(children) || children.length <= 1) return <>{children}</>;

    if(openedWidgets.length == 0) setOpenedWidgets(new Array(Array.isArray(children)? children.length : 0).fill(false));

    return <div ref={groupRef} className='detailExpanderGroup'>
        {children.map((child,i) => (
            <Paper
                key={`detail-expander-group-${i}`}
                elevation={5}
                sx={{backgroundColor: 'brand.white', padding: '8px', width: '100%'}} >
                <div
                    className='detailSection'
                    style={{display: 'flex', flexDirection: 'row', justifyContent: 'flexStart', cursor: 'pointer', pageBreakAfter: 'avoid'}}
                    onClick={() => {
                        if(!openedWidgets[i]){
                            scrollToElement(groupRef.current.querySelectorAll(`.detailSection`)[i].parentNode);
                        }
                        setOpenedWidgets(openedWidgets.map((v, j) => {
                            if(allowMultiple){
                                return (i == j)? !v : v
                            }else{
                                return i == j;
                            }
                        }))
                    }}
                >
                    <Typography variant='h6'>{child.props.title}</Typography>
                    <IconButton sx={{'@media print': {display: 'none'}}}>
                        {openedWidgets[i]? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </div>
                {openedWidgets[i] && 
                    <>
                        <hr style={{pageBreakAfter: 'avoid'}}/>
                        <div style={{textAlign: 'left'}}>
                            {child}
                        </div>
                    </>
                }
            </Paper>
        ))}
    </div>;
}

export const formatDate = (time, displayTimezone=null) => {
    if(!time) return '';
    if(displayTimezone === null) displayTimezone = DateTime.now().zone.name;

    return DateTime.fromJSDate(new Date(time))
        .setZone(displayTimezone)
        .toLocaleString(DateTime.DATETIME_FULL)
}

export const isValidDate = (d) => {
    if (d instanceof Date) return !isNaN(d.valueOf())
    if (typeof (d) === 'string') return !isNaN(new Date(d).valueOf())
    return false
}