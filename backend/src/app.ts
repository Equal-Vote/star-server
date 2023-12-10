require('dotenv').config();
import express from 'express';
var electionRouter = require('./Routes/elections.routes')
// var debugRouter = require('./Routes/debug.routes')

import cors from 'cors';
import cookieParser from 'cookie-parser';
import Logger from './Services/Logging/Logger';
import {IRequest, iRequestMiddleware, reqIdSuffix} from './IRequest';
import { loggerMiddleware } from './Services/Logging/LoggerMiddleware';
import { errorCatch } from './errorCatchMiddleware'
import registerEvents from './Routes/registerEvents';

const { getUserToken } = require('./Controllers/getUserTokenController')
const authController = require('./Controllers/auth.controllers')
const asyncHandler = require('express-async-handler')

export default function makeApp() {

const app = express();
const appInitContext = Logger.createContext("appInit");

// CORS (Cross-origin resource sharing), allows for the backend to receive calls from the front end, even though they have different urls/origins
//      (at least that's my understanding)
const prodEndpoints : any = process.env.ALLOWED_URLS?.split(',') || 'https://dev.star.vote/';
app.use(cors({
    origin: prodEndpoints,
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
app.use('/API',authController.getUser, electionRouter)
// app.use('/debug',debugRouter)

app.post('/API/Token', asyncHandler(getUserToken));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, frontendPath + "index.html"));
})

app.use(errorCatch);

registerEvents();

Logger.debug(appInitContext, "app Init complete");

return app;
}