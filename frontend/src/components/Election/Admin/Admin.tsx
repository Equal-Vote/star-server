import React from 'react'
import Container from '@mui/material/Container';
import ViewElectionRolls from "./ViewElectionRolls";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EditRoles from './EditRoles';
import ViewBallots from './ViewBallots';
import AdminHome from './AdminHome';
const Admin = ({ authSession, election, permissions, fetchElection }) => {
    return (
        <Container>
            <Routes>
                <Route path='/' element={<AdminHome election={election} permissions={permissions} fetchElection={fetchElection}/>} />
                <Route path='/rolls' element={<ViewElectionRolls election={election} permissions={permissions} />} />
                <Route path='/roles' element={<EditRoles election={election} permissions={permissions} />} />
                <Route path='/ballots' element={<ViewBallots election={election} permissions={permissions} />} />
            </Routes>
        </Container>
    )
}

export default Admin
