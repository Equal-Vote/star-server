import { randomUUID } from 'crypto';
import { Request } from 'express';

export interface IRequest extends Request {
    contextId?: string;
}

export function reqIdSuffix(req:IRequest):string {
    return ` (${req.contextId})`;
}

export function iRequestMiddleware(req:IRequest, _res:any, next:any):void {
    req.contextId = randomUUID();
    next();
}