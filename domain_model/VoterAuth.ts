export interface VoterAuth {
    authorized_voter: boolean;
    required: string;
    has_voted: boolean;
    permissions: string[]
}