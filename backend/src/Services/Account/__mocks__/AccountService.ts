import { InternalServerError, Unauthorized } from "@curveball/http-errors";
import { IRequest } from '../../../IRequest';
import Logger from "../../Logging/Logger";

var jwt = require('jsonwebtoken');

export default class AccountService {

    privateKey = "privateKey";
    verify = false;

    constructor() {
    }

    getToken = async (req: any) => {
        return {}
    }

    extractUserFromRequest = (req:IRequest) => {
        const token = req.cookies.id_token;
        if (!this.verify){
            return jwt.decode(token);
        }
        try {
            return jwt.verify(token, this.privateKey);
        } catch (e:any){
            return null;
        }
    }
}