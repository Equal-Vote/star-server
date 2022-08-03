import { IRequest, reqIdSuffix } from "../IRequest"
import { Unauthorized } from "@curveball/http-errors/dist"
import { Election, electionValidation } from "../../../domain_model/Election";
import Logger from "../Services/Logging/Logger"
import { BadRequest, InternalServerError } from "@curveball/http-errors";
import { Request, Response } from 'express';

var jwt = require('jsonwebtoken')

export function expectUserFromRequest(req:IRequest ):any {
    var user = jwt.decode(req.cookies.id_token);
    if (user == null || user == {}){
      throw new Unauthorized();
    }
    return user;
  }

export function expectValidElectionFromRequest(req:IRequest):Election {
    const inputElection = req.body.Election;
    const validationErr = electionValidation(inputElection);
    if (validationErr) {
        Logger.info(req, "Invalid Election: " + validationErr, inputElection);
        throw new BadRequest("Invalid Election");
    }
    return inputElection;
}

export function catchAndRespondError(req:IRequest, res:Response, err:any):Response<any, Record<string, any>> {
    var status = 500;
    if (err.httpStatus) {
        status = err.httpStatus;
    }
    var msg = "Error";
    if (err.detail) {
        msg = err.detail;
    }
    msg += reqIdSuffix(req);
    return res.status(status).json({error:msg});
}