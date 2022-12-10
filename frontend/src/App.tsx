import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import theme from './theme'
import { ThemeProvider } from '@mui/material/styles'
import Header from './components/Header'
import Elections from './components/Elections'
import Login from './components/Login'
import AddElection from './components/ElectionForm/AddElection'
import Election from './components/Election/Election'
import DuplicateElection from './components/ElectionForm/DuplicateElection'
import Sandbox from './components/Sandbox'
import DebugPage from './components/DebugPage'
import LandingPage from './components/LandingPage'
import { CssBaseline } from '@mui/material'
import { useAuthSession } from './hooks/useAuthSession'

const App = () => {
  const authSession = useAuthSession()
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <Header authSession={authSession} />
        <Routes>
          <Route path='/' element={<LandingPage authSession={authSession}/>} />
          <Route path='/Elections' element={<Elections authSession={authSession}/>} />
          <Route path='/Login' element={<Login />} />
          <Route path='/Debug' element={<DebugPage authSession={authSession}/>} />
          <Route path='/CreateElection' element={<AddElection authSession={authSession}/>} />
          <Route path='/Election/:id/*' element={<Election authSession={authSession}/>} />
          <Route path='/DuplicateElection/:id' element={<DuplicateElection authSession={authSession}/>} />
          <Route path='/Sandbox' element={<Sandbox />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
