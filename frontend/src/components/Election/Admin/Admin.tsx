import React from 'react'
import Container from '@mui/material/Container';
import ViewElectionRolls from "./ViewElectionRolls";
const Admin = ({ authSession, election}) => {
    return (
        <Container >
            <ViewElectionRolls election={election}/>
        </Container>
    )
}

export default Admin
