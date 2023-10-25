import { Card, CardActionArea, CardContent, Paper, Typography } from "@mui/material";
import React from 'react';
import { useNavigate } from "react-router";


export default ({electionId}) => {
    const navigate = useNavigate();

    return <Card className='featuredElection' onClick={() => navigate(`/Election/${electionId}`)} elevation={8} sx={{
        width: '100%',
        maxWidth: '20rem',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: '0',
    }}>
        <CardActionArea sx={{p: { xs: 2, md: 2 }}}>
            <CardContent>
                <Typography variant='h5'>Election Title</Typography>
                <Typography variant='h6'>election info</Typography>
                <Typography variant='h6'>election info</Typography>
            </CardContent>
        </CardActionArea>
    </Card>
}