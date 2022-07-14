require('dotenv').config();
import express from 'express';
var electionRouter = require('./Routes/elections.routes')
// var debugRouter = require('./Routes/debug.routes')
import axios from 'axios';
import qs from 'qs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Logger from './Services/Logging/Logger';
import {IRequest, iRequestMiddleware, reqIdSuffix} from './IRequest';
import { responseErr } from './Util';
import { loggerMiddleware } from './Services/Logging/LoggerMiddleware';

export default function makeApp() {

const app = express();
const appInitContext = Logger.createContext("appInit");

// CORS (Cross-origin resource sharing), allows for the backend to receive calls from the front end, even though they have different urls/origins
//      (at least that's my understanding)
app.use(cors({
    origin: [
        'https://star-vote.herokuapp.com/',
        'http://localhost:3000', // since this is the server side I can't use window.location.href :'(
        // these are to verify that it works during the PR phase
        'https://star-vote-review-1.herokuapp.com/',
        'https://star-vote-review-2.herokuapp.com/',
        'https://star-vote-review-3.herokuapp.com/',
    ],
    credentials: true, // allow the backend to receive cookies from the frontend
}))

// Set to trust proxy so we can resolve client IP address
app.enable('trust proxy')

app.use(iRequestMiddleware);
app.use(loggerMiddleware);

app.use(cookieParser())

const frontendPath = '../../../../frontend/build/';

const path = require('path');
app.use(express.static(path.join(__dirname, frontendPath)));
app.use(express.json());

//Routes
app.use('/API',electionRouter)
// app.use('/debug',debugRouter)

const prodEndpoints : any = [
  'https://star-vote.herokuapp.com/',
];

// TODO: This should probably be placed under a route as well. I considered putting it under elections.routes.js, but it doesn't seem like a good fit
app.post('/API/Token', (req:IRequest, res) => {
    // TODO: I was seeing issues where this API get's called twice
    //       this is a problem because code's can only be used once, and the other call with get 'invalid_grant'
    //       removing strict mode fixed it: https://stackoverflow.com/questions/50819162/why-is-my-function-being-called-twice-in-react
    //       this probably means I'm making my /API/Token call in a bad place?
    // TODO: load this from a shared config file
    //       Github Issue:  https://github.com/Equal-Vote/star-server/issues/14

    const keycloakBaseUrl = process.env.KEYCLOAK_URL;
    const keycloakAuthConfig = {
        clientId: 'star_vote_web',
        responseType: 'code',
        endpoints: {
            login: `${process.env.KEYCLOAK_URL}/auth`,
            logout: `${process.env.KEYCLOAK_URL}/logout`,
            token: `${process.env.KEYCLOAK_URL}/token`,
            authorize: `${process.env.KEYCLOAK_URL}/auth`,
            userinfo: `${process.env.KEYCLOAK_URL}/userinfo`
        },
    }
    const authConfig = keycloakAuthConfig;

    // "any" is the only way I could get this to work (https://blog.logrocket.com/building-type-safe-dictionary-typescript/)
    var params: any = {
        grant_type: req.query.grant_type,
        client_id: authConfig.clientId,
        redirect_uri: req.query.redirect_uri,
    };
    Logger.debug(req, params);

    // either refresh_token, or authorization_code
    if(req.query.hasOwnProperty('code')){
        params.code = req.query.code;
    }else{
        // TODO: I should probably be validating the refresh tokens, possibly using the express-jwt library
        //          https://github.com/auth0/express-jwt
        // Github Issue: https://github.com/Equal-Vote/star-server/issues/21
        params.refresh_token = req.cookies.refresh_token;
    }

    Logger.debug(req, `GET TOKEN ${params.grant_type}`);

    axios.post(
        authConfig.endpoints.token,
        qs.stringify(params), 
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${authConfig.clientId}:${process.env.KEYCLOAK_SECRET}`).toString('base64')}`
            }
        }
    )
    .then(res => res.data)
    .then(data => {Logger.debug(appInitContext, "success!"); res.json(data)})
    .catch((err) => {
        Logger.error(req, 'Error while requesting a token', err.response.data);
        responseErr(res, req, 500, "Error requesting token");
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, frontendPath + "index.html"));
})

Logger.debug(appInitContext, "app Init complete");
return app;
}