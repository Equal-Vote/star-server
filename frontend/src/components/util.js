import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Grid, IconButton, Paper, Typography } from '@mui/material'
import React, { useState, useRef, useEffect }  from 'react'
import _uniqueId from 'lodash/uniqueId';

export function scrollToElement(e){
    setTimeout(() => {
        // TODO: I feel like there's got to be an easier way to do this
        let openedSection = (typeof e === 'function')? e() : e;

        console.log("opened", openedSection, NodeList.prototype.isPrototypeOf(openedSection))
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

        console.log(elemTop, windowTop, elemBottom, windowBottom);

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
        <div className={`detailExpander ${expanderId}`} style={{display: 'flex', flexDirection: 'row', gap: 10, justifyContent: 'center', cursor: 'pointer', alignItems: 'center'}} onClick={() => {
            if(!viewDetails){
                scrollToElement(document.querySelector(`${expanderId}:first-child`))
            }
            setViewDetails(!viewDetails)
        }}>
            <Typography variant='h6'>{title}</Typography>
            {!viewDetails && <ExpandMore />}
            {viewDetails && <ExpandLess />}
        </div>
        {viewDetails && children}
    </>
}

export const DetailExpanderGroup = ({children, defaultSelectedIndex}) => {
    const [widgetIndex, setWidgetIndex] = useState(defaultSelectedIndex);

    const groupRef = useRef(null);


    if(!Array.isArray(children)) return <>children</>;

    return <div ref={groupRef} className='detailExpanderGroup'>
        {children.map((child,i) => (
            <Paper
                elevation={5}
                sx={{backgroundColor: 'brand.white', padding: '8px', width: '100%'}} >
                <div
                    className='detailSection'
                    style={{display: 'flex', flexDirection: 'row', justifyContent: 'flexStart', cursor: 'pointer'}}
                    onClick={() => {
                        if((widgetIndex != i)){
                            scrollToElement(groupRef.current.querySelectorAll(`.detailSection`)[i].parentNode);
                        }
                        setWidgetIndex((widgetIndex == i)? -1 : i);
                    }}
                >
                    <Typography variant='h6'>{child.props.title}</Typography>
                    <IconButton>
                        {(widgetIndex != i) && <ExpandMore />}
                        {(widgetIndex == i) && <ExpandLess />}
                    </IconButton>
                </div>
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
    </div>;
}