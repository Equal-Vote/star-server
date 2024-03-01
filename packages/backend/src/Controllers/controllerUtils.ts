import { IRequest, reqIdSuffix } from "../IRequest"
import { Election, electionValidation } from "shared/domain_model/Election";
import Logger from "../Services/Logging/Logger"
import { BadRequest, InternalServerError, Unauthorized } from "@curveball/http-errors";
import { Request, Response } from 'express';
import { roles } from "shared/domain_model/roles";
import { hasPermission, permission, permissions } from 'shared/domain_model/permissions';
import { randomUUID, createHash } from "crypto";
import ServiceLocator from "../ServiceLocator";
const accountService = ServiceLocator.accountService();

export function expectValidElectionFromRequest(req:IRequest):Election {
    const inputElection = req.body.Election;
    inputElection.election_id = randomUUID();
    inputElection.create_date = new Date().toISOString()
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

export function expectPermission(roles:roles[],permission:permission):any {
        if (!roles.some( (role) => permission.includes(role))){
            throw new Unauthorized("Does not have permission")
      }
}

export function hashString(inputString: string) {
    return createHash('sha256').update(inputString).digest('hex')
}