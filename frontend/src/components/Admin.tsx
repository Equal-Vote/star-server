import { useEffect, useState } from "react"
import StarBallot from "./StarBallot";
import useFetch from "../useFetch";
import { useParams } from "react-router";
import React from 'react'
import { useNavigate } from "react-router";
import { Ballot } from "../../../domain_model/Ballot";
import { Vote } from "../../../domain_model/Vote";
import { Score } from "../../../domain_model/Score";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ProfilePic from '../images/blank-profile.png'
import { Link } from "react-router-dom"
import { createTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import TextField from "@material-ui/core/TextField";
import Box from '@material-ui/core/Box';
import { Tooltip } from "@material-ui/core";
import ViewElectionRolls from "./ViewElectionRolls";
const Admin = ({ authSession }) => {
    return (
        <Container >
            <ViewElectionRolls />
        </Container>
    )
}

export default Admin
