import React from 'react'
import Container from '@material-ui/core/Container';
import ViewElectionRolls from "./ViewElectionRolls";
const Admin = ({ authSession }) => {
    return (
        <Container >
            <ViewElectionRolls />
        </Container>
    )
}

export default Admin
