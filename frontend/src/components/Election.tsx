import { useEffect, useState } from "react"
import useFetch from "../useFetch";
import { useParams } from "react-router";
import React from 'react'
import { useNavigate } from "react-router";
// import { Route, Redirect, useRouteMatch, useHistory } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import VoterAuth from "./VoterAuth";
import ElectionHome from "./ElectionHome";
import EditElection from './EditElection'
import VotePage from './VotePage'
import Admin from './Admin'
import ViewElectionResults from './ViewElectionResults'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from "./Sidebar";
import { Grid } from "@material-ui/core";

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
        <Grid container>
          <Grid item xs={2}>
            <Sidebar electionData={data} />
          </Grid>
          <Grid xs={8}>
            <VoterAuth authSession={authSession} electionData={data} fetchElection={fetchData} />
            <Routes>
              <Route path='/' element={<ElectionHome authSession={authSession} electionData={data} fetchElection={fetchData} />} />
              <Route path='/vote' element={<VotePage election={data.election} fetchElection={fetchData}/>} />
              <Route path='/results' element={<ViewElectionResults election={data.election} />} />
              <Route path='/edit' element={<EditElection authSession={authSession} election={data.election} />} />
              <Route path='/admin' element={<Admin authSession={authSession} election={data.election} />} />
            </Routes>
          </Grid>
        </Grid >
      }
    </>
  )
}

export default Election