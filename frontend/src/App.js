import React from 'react'
import Header from './components/Header'
import Elections from './components/Elections'
import AddElection from './components/AddElection'
import VotePage from './components/VotePage'
import ViewElectionResults from './components/ViewElectionResults'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

const App = () => {

  return (
    <Router>
      <div className="container">
        <Header/>
        <Switch>
          <Route exact path='/'> 
            <Elections/>
          </Route>
          <Route exact path='/CreateElection'> 
            <AddElection />
          </Route>
          <Route path='/Election/:id'> 
            <VotePage />
          </Route>
          <Route path='/ElectionResults/:id'> 
            <ViewElectionResults />
          </Route>
        </Switch>
        
      </div>
    </Router>
  );
}

export default App;
