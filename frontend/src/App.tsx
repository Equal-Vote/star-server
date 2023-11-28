import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import theme from './theme'
import { ThemeProvider } from '@mui/material/styles'
import Header from './components/Header'
import Elections from './components/Elections'
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

const App = () => {
  return (
    <Router>
      <ThemeProvider theme={theme}>
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
                    <Route path='/' element={<LandingPage />} />
                    <Route path='/About' element={<About />} />
                    <Route path='/Elections' element={<Elections />} />
                    <Route path='/Login' element={<Login />} />
                    <Route path='/CreateElection' element={<CreateElectionTemplates />} />
                    <Route path='/Election/:id/*' element={<Election />} />
                    <Route path='/Sandbox' element={<Sandbox />} />
                  </Routes>
                </Box>
                <Footer />
              </Box>
            </SnackbarContextProvider>
          </ConfirmDialogProvider>
        </AuthSessionContextProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
