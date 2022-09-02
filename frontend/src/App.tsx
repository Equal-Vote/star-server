import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import theme from './theme'
import { ThemeProvider } from '@material-ui/styles'
import authSession from './authSession'
import Header from './components/Header'
import Elections from './components/Elections'
import Login from './components/Login'
import AddElection from './components/AddElection'
import Election from './components/Election'
import DuplicateElection from './components/DuplicateElection'
import Sandbox from './components/Sandbox'
import DebugPage from './components/DebugPage'

const App = () => {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Header authSession={authSession} />
        <Routes>
          <Route path='/' element={<Elections authSession={authSession}/>} />
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
