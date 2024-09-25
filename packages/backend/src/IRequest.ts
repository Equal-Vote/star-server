import { randomUUID } from 'crypto';
import { Request } from 'express';
import { Election } from '@equal-vote/star-vote-shared/domain_model/Election';
import { roles } from '@equal-vote/star-vote-shared/domain_model/roles';
import { permission, permissions } from '@equal-vote/star-vote-shared/domain_model/permissions';

type p = keyof typeof permissions

export interface IRequest extends Request {
    contextId?: string;
    logPrefix?: string;
    user?: any;
}

export interface IElectionRequest extends IRequest {
    election: Election;
    user_auth: {
        roles: roles[];
        permissions: p[]
    }
    authorized_voter?: boolean;
    has_voted?: boolean;

}

export function reqIdSuffix(req:IRequest):string {
    return ` (${req.contextId})`;
}

export function iRequestMiddleware(req:IRequest, _res:any, next:any):void {
    req.contextId = randomUUID().slice(0,8);
    next();
}