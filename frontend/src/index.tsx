import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { makeServer } from "./server";
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuthSession } from './hooks/useAuthSession'

// I added USE_MIRAGE=true to the .env file, not sure why it's not working?
//if(process.env.USE_MIRAGE == 'true'){
  makeServer({environment: 'development'})
//}


const authSession = useAuthSession()
ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App authSession={authSession}/>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
