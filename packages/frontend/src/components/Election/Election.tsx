import { useParams } from "react-router";
import React, { useEffect } from 'react'
import ElectionHome from "./ElectionHome";
import EditElection from '../ElectionForm/EditElection'
import VotePage from './Voting/VotePage'
import Admin from './Admin/Admin'
import ViewElectionResults from './Results/ViewElectionResults'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from "./Sidebar";
import { Box, Grid } from "@mui/material";
import Thanks from "./Voting/Thanks";
import ViewBallot from "./Admin/ViewBallot";
import useElection, { ElectionContextProvider } from "../ElectionContextProvider";
import { useElectionExists } from "../../hooks/useAPI";
import { sharedConfig } from "shared/config";

const Election = () => {
  const { id } = useParams();
  const {data, makeRequest: fetchExists } = useElectionExists(id)
  if(data?.exists === 'classic'){
    window.location.href = `${sharedConfig.CLASSIC_DOMAIN}/${id}`;
  }

  useEffect(() => {
      fetchExists()
  }, [id])

  return (
    <ElectionContextProvider id={id} >
      <Box display='flex' sx={{flexDirection: {xs: 'column', md: 'row'}, mt: {xs: 0, sm: 5}, mb: {xs: 0, sm: 5}}}>
        <Box sx={{maxWidth: {xs: '100%', md: '16%'}}}>
          <Sidebar />
        </Box>
        <Box sx={{ml: 'auto', mr: 'auto', mt: '0'}}>
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
        </Box>
      </Box>
    </ElectionContextProvider>
  )
}

export default Election