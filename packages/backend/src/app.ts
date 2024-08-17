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
import { setupSockets } from './socketHandler';

const { getUserToken } = require('./Controllers/getUserTokenController')
const authController = require('./Controllers/auth.controllers')
const asyncHandler = require('express-async-handler')
require('./socketHandler')

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

    //const frontendPath = '../../../../packages/frontend/build/';
    const frontendPath = '../../../packages/frontend/build/';

    const path = require('path');
    app.use(express.json());
    //Routes
    app.use('/API',authController.getUser, electionRouter)
    // app.use('/debug',debugRouter)

    app.post('/API/Token', asyncHandler(getUserToken));

    app.get('*', (req, res) => {
        const fs = require('fs');
        fs.readFile(path.join(__dirname, frontendPath, req.url), 'utf8', (err:any, htmlData:string) => {
            if(err){
                // https://blog.logrocket.com/adding-dynamic-meta-tags-react-app-without-ssr/
                fs.readFile(path.join(__dirname, frontendPath, 'index.html'), 'utf8', (err:any, htmlData:string) => {
                    if(err){
                        console.error('Error during file reading', err);
                        return res.status(404).end();
                    }

                    // inject tags
                    let tags = {
                        __META_TITLE__: 'dev.star.vote',
                        __META_DESCRIPTION__: "Create secure elections with voting methods that don't spoil the vote.",
                        __META_IMAGE__: 'https://assets.nationbuilder.com/unifiedprimary/pages/1470/attachments/original/1702692040/Screenshot_2023-12-15_at_6.00.24_PM.png?1702692040'
                    };

                    Object.entries(tags).forEach(([key, value]) => {
                        htmlData = htmlData.replaceAll(key, value);
                    });

                    return res.send(htmlData)
                })
            }else{
                res.sendFile(path.join(__dirname, frontendPath, req.url))
            }
        })
    })

    app.use(errorCatch);

    registerEvents();

    Logger.debug(appInitContext, "app Init complete");

    return app;
}
