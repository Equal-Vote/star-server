import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeContextProvider } from './theme'
import Header from './components/Header'
import Login from './components/Login'
import CreateElectionTemplates from './components/ElectionForm/CreateElectionTemplates'
import Election from './components/Election/Election'
import Sandbox from './components/Sandbox'
import LandingPage from './components/LandingPage'
import { Box, CssBaseline } from '@mui/material'
import { SnackbarContextProvider } from './components/SnackbarContext'
import Footer from './components/Footer'
import { ConfirmDialogProvider } from './components/ConfirmationDialogProvider'
import About from './components/About'
import { AuthSessionContextProvider } from './components/AuthSessionContextProvider'
import ElectionInvitations from './components/Elections/ElectionInvitations'
import ElectionsYouManage from './components/Elections/ElectionsYouManage'
import ElectionsYouVotedIn from './components/Elections/ElectionsYouVotedIn'
import OpenElections from './components/Elections/OpenElections'

const App = () => {
  return (
    <Router>
      <ThemeContextProvider>
        <AuthSessionContextProvider>
          <ConfirmDialogProvider>
            <SnackbarContextProvider>
              <CssBaseline />
              <Box display='flex' flexDirection='column' minHeight={'100vh'} >
                <Header />
                <Box
                  sx={{
                    width: '100%',
                  }}>
                  <Routes>
                    {/* Routes should always include some upper case so that they don't conflict with custom slugs */}
                    <Route path='/' element={<LandingPage />} />
                    <Route path='/About' element={<About />} />
                    <Route path='/ElectionInvitations' element={<ElectionInvitations />} />
                    <Route path='/ElectionsYouManage' element={<ElectionsYouManage />} />
                    <Route path='/ElectionsYouVotedIn' element={<ElectionsYouVotedIn />} />
                    <Route path='/OpenElections' element={<OpenElections />} />
                    <Route path='/Login' element={<Login />} />
                    <Route path='/CreateElection' element={<CreateElectionTemplates />} />
                    <Route path='/Election/:id/*' element={<Election />} /> {/*Only supporting the old path for legacy reasons*/}
                    <Route path='/Sandbox' element={<Sandbox />} />
                    <Route path='/:id/*' element={<Election />} />
                  </Routes>
                </Box>
                <Footer />
              </Box>
            </SnackbarContextProvider>
          </ConfirmDialogProvider>
        </AuthSessionContextProvider>
      </ThemeContextProvider>
    </Router>
  );
}

export default App;
