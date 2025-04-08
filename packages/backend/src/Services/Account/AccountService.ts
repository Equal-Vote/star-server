import Logger from '../Logging/Logger';
import axios from 'axios';
import qs from 'qs';
import 'dotenv/config';
import { InternalServerError, Unauthorized } from "@curveball/http-errors";
import { IRequest } from '../../IRequest';
import { Election } from '@equal-vote/star-vote-shared/domain_model/Election';
import AccountServiceUtils from './AccountServiceUtils';

var jwt = require('jsonwebtoken');

export default class AccountService {
    authConfig;
    private privateKey:string;
    private publicKey: string;

    constructor() {
        const keycloakAuthConfig = {
            clientId: 'web',
            responseType: 'code',
            endpoints: {
                login: `${process.env.KEYCLOAK_URL}/auth`,
                logout: `${process.env.KEYCLOAK_URL}/logout`,
                token: `${process.env.KEYCLOAK_URL}/token`,
                authorize: `${process.env.KEYCLOAK_URL}/auth`,
                userinfo: `${process.env.KEYCLOAK_URL}/userinfo`
            },
        }
        this.authConfig = keycloakAuthConfig;
        if (!process.env.KEYCLOAK_SECRET){
            throw new Error("AccountService missing process.env.KEYCLOAK_SECRET");
        } else {
            this.privateKey = process.env.KEYCLOAK_SECRET;
        }
        if (!process.env.KEYCLOAK_PUBLIC_KEY){
            throw new Error("AccountService missing process.env.KEYCLOAK_PUBLIC_KEY");
        } else {
            this.publicKey = ['-----BEGIN PUBLIC KEY-----',process.env.KEYCLOAK_PUBLIC_KEY,'-----END PUBLIC KEY-----',].join('\n');;
        }
    }

    getToken = async (req: any) => {
        var params: any = {
            grant_type: req.query.grant_type,
            client_id: this.authConfig.clientId,
            redirect_uri: req.query.redirect_uri,
        };
        Logger.debug(req, params);

        // either refresh_token, or authorization_code
        if (req.query.hasOwnProperty('code')) {
            params.code = req.query.code;
        } else {
            // TODO: I should probably be validating the refresh tokens, possibly using the express-jwt library
            //          https://github.com/auth0/express-jwt
            // Github Issue: https://github.com/Equal-Vote/star-server/issues/21
            params.refresh_token = req.cookies.refresh_token;
        }

        Logger.debug(req, `GET TOKEN ${params.grant_type}`);
        try {
            const response = await axios.post(
                this.authConfig.endpoints.token,
                qs.stringify(params),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(`${this.authConfig.clientId}:${process.env.KEYCLOAK_SECRET}`).toString('base64')}`
                    }
                }
            )
            Logger.debug(req, "success!");
            return response.data
        } catch (err: any) {
            Logger.error(req, err);
            Logger.error(req, this.authConfig.clientId);
            Logger.error(req, process.env.KEYCLOAK_SECRET);
            Logger.error(req, 'Error while requesting a token', err.response.data);
            throw new InternalServerError("Error requesting token");
        };
    }

    extractUserFromRequest = (req:IRequest, customKey?:string) => {
        const token = customKey ? req.cookies.custom_id_token : req.cookies.id_token;
        if (token){
            const key = customKey ? customKey : this.publicKey;
            return AccountServiceUtils.extractUserFromRequest(req, token, key);
        }
        const tempId = req.cookies.temp_id;
        if(tempId){
            return {
                'typ': 'TEMP_ID', // keycloak populates typ with ID, so I'm trying to follow a similar convention
                'sub': tempId
            }
        }
        return null
    }
}
