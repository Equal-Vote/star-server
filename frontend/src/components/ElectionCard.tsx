import Button from "./Button"
import { Link } from "react-router-dom"
import React from 'react'
import { Election } from "@domain_model/Election"
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { CardActionArea } from "@mui/material";

type ElectionCardProps = {
    election: Election
}

const ElectionCard = ({ election }: ElectionCardProps) => {

    return (
        <Card >
            {/* //sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} */}
            <CardActionArea href={`/Election/${String(election.election_id)}`} >
                <CardContent>
                    <Typography align='center' gutterBottom variant="h4" component="h4">
                        {election.title}
                    </Typography>
                    <Typography align='left' gutterBottom component="p">
                        {election.description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

export default ElectionCard
