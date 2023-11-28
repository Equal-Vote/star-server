import React from 'react'
import Container from '@mui/material/Container';
import ViewElectionRolls from "./ViewElectionRolls";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EditRoles from './EditRoles';
import ViewBallots from './ViewBallots';
import AdminHome from './AdminHome';
const Admin = () => {
    return (
        <Container>
            <Routes>
                <Route path='/' element={<AdminHome />} />
                <Route path='/voters' element={<ViewElectionRolls />} />
                <Route path='/roles' element={<EditRoles />} />
                <Route path='/ballots' element={<ViewBallots />} />
            </Routes>
        </Container>
    )
}

export default Admin
