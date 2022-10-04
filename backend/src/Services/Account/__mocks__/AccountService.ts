import { InternalServerError, Unauthorized } from "@curveball/http-errors";
import { IRequest } from '../../../IRequest';
import Logger from "../../Logging/Logger";
import AccountServiceUtils from "../AccountServiceUtils";

var jwt = require('jsonwebtoken');

export default class AccountService {

    privateKey = "privateKey";
    verify = false;

    constructor() {
    }

    getToken = async (req: any) => {
        return {}
    }

    extractUserFromRequest  = (req:IRequest, customKey?:string) => {
        const token = req.cookies.id_token;
        if (!this.verify){
            return jwt.decode(token);
        }

        const key = customKey ? customKey : this.privateKey;
        return AccountServiceUtils.extractUserFromRequest(req, token, key);
    }
}