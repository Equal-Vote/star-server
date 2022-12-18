import { useEffect, useState } from "react"
import useFetch from "../../hooks/useFetch";
import { useParams } from "react-router";
import React from 'react'
import { useNavigate } from "react-router";
// import { Route, Redirect, useRouteMatch, useHistory } from 'react-router-dom';
import Container from '@mui/material/Container';
import VoterAuth from "./VoterAuth";
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

const Election = ({ authSession }) => {
  const { id } = useParams();
  const { data, isPending, error, makeRequest: fetchData } = useFetch(`/API/Election/${id}`, 'get')

  useEffect(() => {
    fetchData()
  }, [])
  
  const navigate = useNavigate();
  
  return (
    <>
      {error && <div> {error} </div>}
      {isPending && <div> Loading Election... </div>}
      {data?.election &&
        <Grid container sx={{ mt: {xs:0, sm: 5}}}>
          <Grid item xs={12} sm={2}>
            <Sidebar electionData={data} />
          </Grid>
          <Grid xs={12} sm={8}>
            <Routes>
              <Route path='/' element={<ElectionHome authSession={authSession} electionData={data} fetchElection={fetchData} />} />
              <Route path='/vote' element={<VotePage election={data.election} fetchElection={fetchData}/>} />
              <Route path='/thanks' element={<Thanks election={data.election} />} />
              <Route path='/results' element={<ViewElectionResults election={data.election} />} />
              <Route path='/edit' element={<EditElection authSession={authSession} election={data.election} />} />
              <Route path='/admin/*' element={<Admin authSession={authSession} election={data.election} permissions={data.voterAuth.permissions} />} />
              <Route path='/ballot/:ballot_id' element={<ViewBallot election={data.election} ballot={null} onClose={null} fetchBallot={null} permissions={data.voterAuth.permissions} />} />
            </Routes>
          </Grid>
        </Grid >
      }
    </>
  )
}

export default Election