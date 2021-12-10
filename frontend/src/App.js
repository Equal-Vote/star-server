import React from 'react'
import Header from './components/Header'
import Elections from './components/Elections'
import AddElection from './components/AddElection'
import VotePage from './components/VotePage'
import ViewElectionResults from './components/ViewElectionResults'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const App = () => {

  return (
    <Router>
      <div className="container">
        <Header/>
        <Routes>
          <Route path='/' element={<Elections/>}/> 
          <Route path='/CreateElection' element={<AddElection />}/>
          <Route path='/Election/:id' element={<VotePage/>}/> 
          <Route path='/ElectionResults/:id' element={<ViewElectionResults />}/> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
