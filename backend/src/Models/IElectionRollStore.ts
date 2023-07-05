// import { ElectionRoll } from "../../../domain_model/ElectionRoll";

import { ILoggingContext } from "../Services/Logging/ILogger";
import { ElectionRoll } from "./IElectionRoll";

export interface IElectionRollStore {
    submitElectionRoll: (
        electionRolls: ElectionRoll[],
        ctx: ILoggingContext,
        reason: string
    ) => Promise<boolean>;
    getRollsByElectionID: (
        election_id: string,
        ctx: ILoggingContext
    ) => Promise<ElectionRoll[] | null>;
    getByVoterID: (
        election_id: string,
        voter_id: string,
        ctx: ILoggingContext
    ) => Promise<ElectionRoll | null>;
    getElectionRoll: (
        election_id: string, 
        voter_id: string|null, 
        email: string|null, 
        ip_address: string|null, 
        ctx:ILoggingContext
        ) => Promise<ElectionRoll[] | null>;
    update: (
        election_roll: ElectionRoll,
        ctx: ILoggingContext,
        reason: string
    ) => Promise<ElectionRoll | null>;
    delete: (
        election_roll: ElectionRoll,
        ctx: ILoggingContext,
        reason: string
    ) => Promise<boolean>;
}
