import React from 'react'
import Header from './components/Header'
import Elections from './components/Elections'
import AddElection from './components/AddElection'
import VotePage from './components/VotePage'
import Login from './components/Login'
import ViewElectionResults from './components/ViewElectionResults'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const App = () => {
  /* oAuth2 reference
   * Express Guide: https://www.youtube.com/watch?v=Ppeqd9xXp3Q 
   * Cognito oAuth Endpoints Reference: https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
   * Auth0 Endpoints: https://auth0.com/docs/authorization/protocols/protocol-oauth2
   * openid.net: https://openid.net/specs/openid-connect-core-1_0.html
   */

  // Q: Why not use relative links for the local endpoints? That way you don't have to consider the window location at all
  // A: That was my initial plan, but since the oAuth endpoints will almost always be direct endpoints, I figured I'd keep
  //    it consistent for the testing cases as well
  const localBaseUrl = window.location.origin; 
  const localAuthConfig = {
    endpoints: {
      login: `${localBaseUrl}/Login`,
      token: `${localBaseUrl}/API/oAuth2/token`,
      authorize: `${localBaseUrl}/API/oAuth2/authorize`,
      userinfo: `${localBaseUrl}/API/oAuth2/userinfo`
    },
    params: {
      client_id: 'abcd', // dummy client id for now
      response_type: 'code',
      redirect_uri: window.location.origin,
    }
  }

  const cognitoBaseUrl = 'https://star.auth.us-east-1.amazoncognito.com'
  const cognitoAuthConfig = {
      endpoints: {
        login: `${cognitoBaseUrl}/login`,
        token: `${cognitoBaseUrl}/oauth2/token`,
        authorize: `${cognitoBaseUrl}/oauth2/authorize`,
        userinfo: `${cognitoBaseUrl}/oauth2/userinfo`
      },
      params: {
        client_id: '3j4jcchkffod8q1onipug0oqa4',
        response_type: 'code',
        redirect_uri: window.location.origin,
      }
  }

  // TODO: insert urls for keycloak 

  return (
    <Router>
      <div className="container">
        <Header authConfig={localAuthConfig}/>
        <Routes>
          <Route path='/' element={<Elections/>}/> 
          <Route path='/Login' element={<Login/>}/> 
          <Route path='/CreateElection' element={<AddElection />}/>
          <Route path='/Election/:id' element={<VotePage/>}/> 
          <Route path='/ElectionResults/:id' element={<ViewElectionResults />}/> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;