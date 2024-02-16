import { useParams } from "react-router";
import React from 'react'
import ElectionHome from "./ElectionHome";
import EditElection from '../ElectionForm/EditElection'
import VotePage from './Voting/VotePage'
import Admin from './Admin/Admin'
import ViewElectionResults from './Results/ViewElectionResults'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from "./Sidebar";
import { Grid } from "@mui/material";
import Thanks from "./Voting/Thanks";
import ViewBallot from "./Admin/ViewBallot";
import { ElectionContextProvider } from "../ElectionContextProvider";

const Election = () => {
  const { id } = useParams();

  return (
    <ElectionContextProvider id={id} >
      <Grid container sx={{ mt: { xs: 0, sm: 5 } }}>
        <Grid item xs={12} sm={2}>
          <Sidebar />
        </Grid>
        <Grid item xs={12} sm={10}>
          <Routes>
            <Route path='/' element={<ElectionHome />} />
            <Route path='/vote' element={<VotePage />} />
            <Route path='/thanks' element={<Thanks />} />
            <Route path='/results' element={<ViewElectionResults />} />
            <Route path='/edit' element={<EditElection />} />
            <Route path='/admin/*' element={<Admin />} />
            <Route path='/ballot/:ballot_id' element={<ViewBallot ballot={null} onClose={null} />} />
            <Route path='/id/:voter_id' element={<ElectionHome />} />
          </Routes>
        </Grid>
      </Grid >
    </ElectionContextProvider>
  )
}

export default Election