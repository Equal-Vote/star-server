import Button from "./Button"
import { Link } from "react-router-dom"
import React from 'react'
import { Election } from "../../../domain_model/Election"
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import { CardActionArea } from "@material-ui/core";

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

                    {/* <Link to={`/Election/${String(election.election_id)}/vote`}>
                        <Typography align='center' gutterBottom variant="h6" component="h6">
                            Vote
                        </Typography>
                    </Link>
                    <Link to={`/Election/${election.election_id}/results`}>
                        <Typography align='center' gutterBottom variant="h6" component="h6">
                            View Results
                        </Typography>
                    </Link> */}
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

export default ElectionCard
