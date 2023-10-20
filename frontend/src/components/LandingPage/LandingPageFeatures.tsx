import { Box, Grid, Typography } from '@mui/material'
import React from 'react'
import FeaturedElection from './FeaturedElection'

export default () => {
    let rowSxProps = {
        marginLeft: 5,
        display: 'flex',
        flexDirection: {xs: 'column', lg: 'row'},
        width: '100%',
        maxWidth: '110rem',
        gap: {xs: '2rem', lg: '8rem'},
    };

    let itemSxProps= {
        flexShrink: '0',
        width: '25%',
        minWidth: '30rem',
    };

    return <Box sx={{
        width: '100%',
        maxWidth: '1300px',
        margin: 'auto',
        p: { xs: 2, md: 2 },
    }}>
        <Typography variant='h4'>Features</Typography>
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '5rem',
            gap: '15rem',
        }}>
            <Box sx={rowSxProps}>
                <Box sx={itemSxProps}>
                    <Typography variant='h5'>Voting Methods</Typography>
                    <Typography variant='h6'>Supports a variety of single and multiwinner voting methods</Typography>
                </Box>
                <Box sx={itemSxProps}>
                    <ul style={{paddingTop: '2rem'}}>
                        <li><b>STAR Voting</b></li>
                        <li><b>STAR PR</b></li>
                        <li><b>Ranked Robin</b></li>
                    </ul>
                </Box>
            </Box>
            <Box sx={{...rowSxProps, flexDirection: {xs: 'column-reverse', lg: 'row'}}}>
                <Box sx={itemSxProps}>
                    <ul style={{paddingTop: '2rem'}}>
                        <li><b>Direct Link</b><br/>great for Open elections</li>
                        <li><b>Email List</b><br/>ballots will be emailed to voters</li>
                        <li><b>Voter ID List</b><br/>voters input an id to access ballot</li>
                    </ul>
                </Box>
                <Box sx={itemSxProps}>
                    <Typography variant='h5'>Reach your Voters</Typography>
                    <Typography variant='h6'>Lots of ways to share ballots with Voters</Typography>
                </Box>
            </Box>
            <Box sx={rowSxProps}>
                <Box sx={itemSxProps}>
                    <Typography variant='h5'>Use Cases</Typography>
                    <Typography variant='h6'>Good for elections of all shapes and sizes</Typography>
                </Box>
                <Box sx={itemSxProps}>
                    <ul style={{paddingTop: '2rem'}}>
                        <li><b>Public Polls</b><br/>for online opinion polling</li>
                        <li><b>Private Polls</b><br/>for your club</li>
                        <li><b>Official Elections</b><br/>for your organization</li>
                    </ul>
                </Box>
            </Box>
        </Box>
    </Box>
}