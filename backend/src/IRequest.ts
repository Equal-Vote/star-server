import { randomUUID } from 'crypto';
import { Request } from 'express';
import { Election } from '../../domain_model/Election';

export interface IRequest extends Request {
    contextId?: string;
    logPrefix?: string;
    election?: Election;
    user?: any;
}

export function reqIdSuffix(req:IRequest):string {
    return ` (${req.contextId})`;
}

export function iRequestMiddleware(req:IRequest, _res:any, next:any):void {
    req.contextId = randomUUID().slice(0,8);
    next();
}