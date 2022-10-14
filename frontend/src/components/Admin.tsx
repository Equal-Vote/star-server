import React from 'react'
import Container from '@material-ui/core/Container';
import ViewElectionRolls from "./ViewElectionRolls";
const Admin = ({ authSession, election}) => {
    return (
        <Container >
            <ViewElectionRolls election={election}/>
        </Container>
    )
}

export default Admin
