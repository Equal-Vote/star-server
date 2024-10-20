import { Election } from '@equal-vote/star-vote-shared/domain_model/Election';
import { roles } from '@equal-vote/star-vote-shared/domain_model/roles';
import { permission, permissions } from '@equal-vote/star-vote-shared/domain_model/permissions';

type p = keyof typeof permissions
export {}
//apparently this is expresses official recommedation for extending types in typescript. I had to add
// this to get elections.routes.ts to work.
declare global {
    namespace Express {
        interface Request {
            contextId?: string;
            logPrefix?: string;
            election: Election;
            user?: any;
            user_auth: {
                roles: roles[];
                permissions: p[]
            }
            authorized_voter?: boolean;
            has_voted?: boolean;
            file: any
        }
    }
}
