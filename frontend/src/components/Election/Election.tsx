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
import { IAuthSession } from "../../hooks/useAuthSession"
import useElection, { ElectionContextProvider } from "../ElectionContextProvider";

type Props = {
  authSession: IAuthSession,
}

const TempWrapper = ({ authSession }: Props) => {
  //Temporary wrapper to get election component inputs 
  //Once components are converted to use election context this can be removed
  
  const { data, election, refreshElection, permissions, updateElection } = useElection()

  return (
    <Grid container sx={{ mt: { xs: 0, sm: 5 } }}>
      <Grid item xs={12} sm={2}>
        <Sidebar electionData={data} />
      </Grid>
      <Grid xs={12} sm={8}>
        <Routes>
          <Route path='/' element={<ElectionHome authSession={authSession} electionData={data} fetchElection={refreshElection} />} />
          <Route path='/vote' element={<VotePage election={data.election} fetchElection={refreshElection} />} />
          <Route path='/thanks' element={<Thanks election={data.election} />} />
          <Route path='/results' element={<ViewElectionResults election={data.election} />} />
          <Route path='/edit' element={<EditElection authSession={authSession} election={data.election} fetchElection={refreshElection} />} />
          <Route path='/admin/*' element={<Admin authSession={authSession} election={data.election} permissions={data.voterAuth.permissions} fetchElection={refreshElection} />} />
          <Route path='/ballot/:ballot_id' element={<ViewBallot election={data.election} ballot={null} onClose={null} fetchBallot={null} permissions={data.voterAuth.permissions} />} />
          <Route path='/id/:voter_id' element={<ElectionHome authSession={authSession} electionData={data} fetchElection={refreshElection} />} />
        </Routes>
      </Grid>
    </Grid >)
}

const Election = ({ authSession }: Props) => {
  const { id } = useParams();
  return (
    <ElectionContextProvider id={id}>
      <TempWrapper authSession={authSession} />
    </ElectionContextProvider>
  )
}

export default Election