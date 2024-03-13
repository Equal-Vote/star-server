import { Election } from "shared/domain_model/Election";
import { Uid } from "shared/domain_model/Uid";
import { ILoggingContext } from "../Services/Logging/ILogger";

export interface IElectionStore {
    createElection: (election: Election, ctx: ILoggingContext, reason: string) => Promise<Election>;
    updateElection: (election: Election, ctx: ILoggingContext, reason: string) => Promise<Election>;
    getElections: (id: string, email: string, ctx: ILoggingContext) => Promise<Election[] | null>;
    getElectionByID: (election_id: Uid, ctx:ILoggingContext) => Promise<Election | null>;
    delete: (election_id: Uid, ctx:ILoggingContext, reason:string) => Promise<boolean>;
    electionExistsByID: (election_id: Uid, ctx: ILoggingContext) => Promise<Boolean | string>;
}