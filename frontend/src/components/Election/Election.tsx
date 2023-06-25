import { useEffect } from "react"
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
import { IAuthSession } from "../../hooks/useAuthSession";
import { useGetElection } from "../../hooks/useAPI";

type Props = {
  authSession: IAuthSession,
}

const Election = ({ authSession }: Props) => {
  const { id } = useParams();
  const { data, isPending, error, makeRequest: fetchData } = useGetElection(id)
  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      {isPending && <div> Loading Election... </div>}
      {data != null &&
        <Grid container sx={{ mt: { xs: 0, sm: 5 } }}>
          <Grid item xs={12} sm={2}>
            <Sidebar electionData={data} />
          </Grid>
          <Grid xs={12} sm={8}>
            <Routes>
              <Route path='/' element={<ElectionHome authSession={authSession} electionData={data} fetchElection={fetchData} />} />
              <Route path='/vote' element={<VotePage election={data.election} fetchElection={fetchData} />} />
              <Route path='/thanks' element={<Thanks election={data.election} />} />
              <Route path='/results' element={<ViewElectionResults election={data.election} />} />
              <Route path='/edit' element={<EditElection authSession={authSession} election={data.election} fetchElection={fetchData} />} />
              <Route path='/admin/*' element={<Admin authSession={authSession} election={data.election} permissions={data.voterAuth.permissions} fetchElection={fetchData} />} />
              <Route path='/ballot/:ballot_id' element={<ViewBallot election={data.election} ballot={null} onClose={null} fetchBallot={null} permissions={data.voterAuth.permissions} />} />
              <Route path='/id/:voter_id' element={<ElectionHome authSession={authSession} electionData={data} fetchElection={fetchData} />} />
            </Routes>
          </Grid>
        </Grid >
      }
    </>
  )
}

export default Election