import { permissions } from "./permissions";
import { roles } from "./roles";

export interface VoterAuth {
    authorized_voter: boolean;
    required: string;
    has_voted: boolean;
    permissions: (keyof typeof permissions)[];
    roles: roles[];
}