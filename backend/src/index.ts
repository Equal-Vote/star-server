import express from 'express';
var electionRouter = require('./Routes/elections.routes')
var debugRouter = require('./Routes/debug.routes')
import axios from 'axios';
import qs from 'qs';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// CORS (Cross-origin resource sharing), allows for the backend to receive calls from the front end, even though they have different urls/origins
//      (at least that's my understanding)
app.use(cors({
    origin: [
        'http://localhost:3000', // since this is the server side I can't use window.location.href :'(
        'https://star-vote-re-oauth-dev-ng9mif5.herokuapp.com/', // this is to verify that it works during the PR phase
        'https://star-vote.herokuapp.com/'
    ],
    credentials: true, // allow the backend to receive cookies from the frontend
}))

app.use(cookieParser())

const frontendPath = '../../../../frontend/build/';

const path = require('path');
app.use(express.static(path.join(__dirname, frontendPath)));
app.use(express.json());

//Routes
app.use('/API',electionRouter)
app.use('/debug',debugRouter)


// TODO: This should probably be placed under a route as well. I considered putting it under elections.routes.js, but it doesn't seem like a good fit
app.post('/API/Token', (req, res) => {
    // TODO: I was seeing issues where this API get's called twice
    //       this is a problem because code's can only be used once, and the other call with get 'invalid_grant'
    //       removing strict mode fixed it: https://stackoverflow.com/questions/50819162/why-is-my-function-being-called-twice-in-react
    //       this probably means I'm making my /API/Token call in a bad place?
    // TODO: load this from a shared config file
    //       Github Issue:  https://github.com/Equal-Vote/star-server/issues/14
    const keycloakBaseUrl = 'https://keycloak.6j0.org/auth/realms/STAR%20Voting/protocol/openid-connect'
    const keycloakAuthConfig = {
        clientId: 'star_vote_web',
        responseType: 'code',
        // redirectUri: window.location.origin,
        // logoutUri: window.location.origin,
        endpoints: {
            login: `${keycloakBaseUrl}/auth`,
            logout: `${keycloakBaseUrl}/logout`,
            token: `${keycloakBaseUrl}/token`,
            authorize: `${keycloakBaseUrl}/auth`,
            userinfo: `${keycloakBaseUrl}/userinfo`
        },
    }
    const authConfig = keycloakAuthConfig;

    // Q: WAIT! You shouldn't be posting client secrets on a public github repo!
    // A: Yes, you're right. But we won't be this particular keycloak host long term, and we'll be deleting the userbase once we're done with it
    //      In the future we should load this from a .env file
    //      Github Issue: https://github.com/Equal-Vote/star-server/issues/20
    const clientSecret = 'rn18lnA0MN0sPAfxdREPlqUroIL5F6Vd';

    // "any" is the only way I could get this to work (https://blog.logrocket.com/building-type-safe-dictionary-typescript/)
    var params: any = {
        grant_type: req.query.grant_type,
        client_id: authConfig.clientId,
        redirect_uri: req.query.redirect_uri,
    };
    console.log(params);

    // either refresh_token, or authorization_code
    if(req.query.hasOwnProperty('code')){
        params.code = req.query.code;
    }else{
        // TODO: I should probably be validating the refresh tokens, possibly using the express-jwt library
        //          https://github.com/auth0/express-jwt
        // Github Issue: https://github.com/Equal-Vote/star-server/issues/21
        params.refresh_token = req.cookies.refresh_token;
    }

    console.log(`GET TOKEN ${params.grant_type}`);

    axios.post(
        authConfig.endpoints.token,
        qs.stringify(params), 
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${authConfig.clientId}:${clientSecret}`).toString('base64')}`
            }
        }
    )
    .then(res => res.data)
    .then(data => {console.log("success!"); res.json(data)})
    .catch((err) => {
        console.error('Error while requesting a token', err.response.data);
        res.status(500).json({
            error: err.message,
        });
    });
});



app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, frontendPath + "index.html"));
})

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
