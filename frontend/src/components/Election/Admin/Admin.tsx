import React from 'react'
import Container from '@mui/material/Container';
import ViewElectionRolls from "./ViewElectionRolls";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EditRoles from './EditRoles';
const Admin = ({ authSession, election, permissions }) => {
    return (
        <Container>
            <Routes>
                <Route path='/rolls' element={<ViewElectionRolls election={election} permissions={permissions} />} />
                <Route path='/roles' element={<EditRoles election={election} permissions={permissions} />} />
            </Routes>
        </Container>
    )
}

export default Admin
